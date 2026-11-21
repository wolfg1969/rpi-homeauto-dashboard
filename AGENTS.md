# AGENTS.md

本文件为在此仓库中工作的 AI 编码代理提供上下文与约定。

## 项目概览

树莓派触摸屏家庭自动化仪表盘。显示时钟/农历、室内外天气、室内外空气质量，并提供灯光控制按钮。

- 技术栈：React 15 + Redux + redux-thunk，Create React App（`react-scripts` 1.0.13）
- 数据来源：Home Assistant REST API；室外天气、空气质量与天气预警统一取自 `qweather_pro` 集成的 `get_weather` 服务（不再使用 QWeather / Domoticz，旧代码仅以注释保留）
- 壁纸：Bing 每日壁纸，通过 nginx 反向代理获取（避免 CORS）
- 界面文案为中文
- 无 TypeScript、无 hooks（React 15 不支持），组件均为 class component

## 常用命令

```bash
npm install          # 安装依赖
npm start            # 开发服务器，http://localhost:3000
npm run build        # 生产构建，输出到 build/
npm test             # CRA/Jest（仅有一个冒烟测试）
npm run eject        # 不要执行
```

注意：`react-scripts` 1.0.13 使用 webpack 3，需要较旧的 Node。Node 17+ 构建时可能报 `ERR_OSSL_EVP_UNSUPPORTED`；更新的 Node 已移除 `process.binding('http_parser')`，`spdy`/`http-deceiver` 会在启动时直接抛 `No such module: http_parser`。推荐用 n 或 nvm 安装 Node 14.21.3 后切换使用，并为其安装独立的 yarn 1.x（corepack 提供的 yarn 需要 Node 18+）。

## 环境变量

配置位于 `.env`（已被 `.gitignore` 忽略），模板见 `.env.example`。变量在启动/构建时注入，修改后需重启开发服务器。

| 变量 | 说明 |
| --- | --- |
| `REACT_APP_HA_API_URL` | HA REST API 根地址，必须包含 `/api`，例如 `http://homeassistant.local:8123/api` |
| `REACT_APP_HA_API_TOKEN` | HA 长期访问令牌，所有请求使用 `Authorization: Bearer <token>` |
| `REACT_APP_HA_WEATHER_ENTITY_ID` | 室外天气实体（`weather.*`），`qweather_pro.get_weather` 服务的调用目标 |
| `REACT_APP_HA_INDOOR_AQI_ENTITY_ID` | 室内空气质量传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_TEMPERATURE_ENTITY_ID` | 室内温度传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_HUMIDITY_ENTITY_ID` | 室内湿度传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_PRESSURE_ENTITY_ID` | 室内气压传感器（`sensor.*`） |

不要在代码中硬编码新的 URL、令牌或实体 ID，统一走环境变量。`src/actions/bingWallpaper.js` 中的 `http://start.home.lan:8083/proxy/` 是已知的硬编码例外。

室外天气、室外空气质量与天气预警统一通过 HA 的 `qweather_pro.get_weather` 服务获取：`REACT_APP_HA_WEATHER_ENTITY_ID` 指向该集成的 `weather.*` 实体，一次响应的 `now`、`daily`、`aqi`、`warning` 等字段分别写入 `outdoorWeather` 与 `outdoorAirQuality` 两个数据域。不再需要单独的室外空气质量传感器和天气预警传感器（早期使用的 `weather.tian_qi` 等实体已不再使用）。

## 架构

```
src/index.js              创建 store（thunk + redux-logger），挂载 <App />
src/App.js                触发初始数据加载、设置轮询定时器、渲染各卡片和控制按钮
src/actions/*.js          thunk action creators，负责调用 HA API 并转换数据
src/reducers/*.js         每个数据域一个 reducer，仅负责保存 state
src/reducers/index.js     combineReducers 注册所有 reducer
src/components/*.js       展示组件，通过 connect/mapStateToProps 取 state
src/helper.js             AQI 数值到颜色 class 的映射
src/registerServiceWorker.js  CRA 默认 service worker
```

### 数据流与轮询

`App.js` 在 `componentDidMount` 中发起首次加载，并用一个每秒的调度器统一驱动时钟与数据轮询。页面隐藏（`document.hidden`）时暂停，恢复可见时立即补跑过期任务；`online` 事件会重置所有任务并立即重试。卸载时会清理定时器和事件监听。

- 时钟：每 1 秒（`CLOCK_TICK` 被 redux-logger 过滤，不打印）
- 室内空气质量 / 室内天气：每 5 分钟（由 `getIndoorWeather` 的一次 `template` 调用同时更新）
- 室外空气质量 / 室外天气：每 30 分钟（由 `getOutdoorWeather` 的一次 `get_weather` 调用同时更新）
- Bing 壁纸：每 12 小时

各任务按“上次开始时间 + 周期”调度，并通过 `inflight` 标记避免慢请求重叠。新增轮询任务时，在 `App.js` 的 `scheduledTasks` 中登记即可，action 应返回 fetch 的 Promise。

### HA REST API 用法

| 用途 | 请求 |
| --- | --- |
| 读取实体状态 | `GET {apiURL}/states/{entity_id}` |
| 模板渲染（室内温湿度/气压/AQI） | `POST {apiURL}/template`，body 为 `{ "template": "..." }`，一次渲染同时返回室内天气与 AQI |
| 室外天气/预报/空气质量/预警 | `POST {apiURL}/services/qweather_pro/get_weather?return_response`，body 为 `{ "entity_id": "weather.*" }` |
| 灯光控制 | `POST {apiURL}/webhook/{hook_name}`（`turn_off_all_lights`、`toggle_door_light`） |

所有请求都带 `Authorization: Bearer ${REACT_APP_HA_API_TOKEN}` 和 `Content-Type: application/json`。

### 数据形状与已知细节

- 室外天气组件期望 `state.outdoorWeather.now = { code: '200', now: {...} }`；`code !== '200'` 时不渲染。
- `getOutdoorWeather` 从 `service_response.now` 取 `text_cn`、`feelsLike`、`windDir`、`windScale` 等字段，从顶层取 `minutely_summary`、`update_time`；服务不返回单位字段，action 中固定为 `°C` 与 `hPa`。风向代码（`sw`、`nne` 等）在 action 中映射为中文名称。
- 预报取 `service_response.daily` 的前 3 天，白天/夜间字段分别来自 `daytime` 与 `nighttime`，温度取 `temp_min` / `temp_max`。
- 室外空气质量取 `service_response.aqi` 的 `aqi` / `category` / `primary`；天气预警取 `service_response.warning` 数组的 `title`（无标题时回退 `text`）。
- `getOutdoorWeather` 一次请求会同时 dispatch `GET_OUTDOOR_WEATHER` 和 `GET_OUTDOOR_AQI`，两个 reducer 分别保存各自的 state。
- 室内 AQI reducer 会把 `unavailable` / `unknown` 视为无效值，保留上一次有效读数并设置 `isStale: true`，组件据此显示离线提示。
- `src/actions/indoorWeather.js` 的模板同时渲染温度、湿度、气压和室内 AQI，并 dispatch `GET_INDOOR_WEATHER` 与 `GET_INDOOR_AQI` 两个 action。AQI 数据位于模板返回的 `aqi` 对象中（`aqi.Data` / `aqi.lastUpdate`），其时间取 AQI 实体自身的 `last_changed`；天气的 `LastUpdate` 取温度实体（`REACT_APP_HA_INDOOR_TEMPERATURE_ENTITY_ID`）的 `last_changed`。
- 室内 AQI 使用 `getChinaAqiClassName`（中国 AQI 分级），室外 AQI 在 `AirQuality` 组件中通过 `aqiData` 分支同样使用该分级；`getAqiClassName` 为另一套分级。
- `App.js` 中 `ClassSchedule` 的渲染已被注释掉，相关 action/reducer/组件仍保留。

## 代码约定

- 2 空格缩进、单引号、语句末尾分号；保持现有文件风格。
- 新增数据域时：在 `src/actions/` 添加 action 常量 + thunk，在 `src/reducers/` 添加 reducer，并在 `src/reducers/index.js` 注册，再在 `App.js` 中接入轮询。
- 网络请求与数据转换放在 action 中；reducer 只做状态合并。
- 组件使用 class component + `connect`，不要引入 hooks 或 React 18 API。
- 依赖版本较旧，非必要不要新增依赖。
- 新增用户可见文案使用中文。
- 不要提交 `.env`、`build/` 或 `node_modules/`。

## 部署

- `setup/server/docker-compose.yml` + `setup/server/nginx.conf`：nginx 容器监听宿主机 `8083`，域名 `start.home.lan`，静态目录为 `./public`，并将 `/proxy/` 转发到 `https://cn.bing.com`。
- 生产构建后需将 `build/` 内容部署到 nginx 的站点目录。
- `setup/client/` 与 README 包含树莓派触摸屏的旋转、Chromium kiosk 自启动、隐藏光标和关闭屏保配置。
