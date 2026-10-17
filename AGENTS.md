# AGENTS.md

本文件为在此仓库中工作的 AI 编码代理提供上下文与约定。

## 项目概览

树莓派触摸屏家庭自动化仪表盘。显示时钟/农历、室内外天气、室内外空气质量，并提供灯光控制按钮。

- 技术栈：React 15 + Redux + redux-thunk，Create React App（`react-scripts` 1.0.13）
- 数据来源：Home Assistant REST API（不再使用 QWeather / Domoticz，旧代码仅以注释保留）
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

注意：`react-scripts` 1.0.13 使用 webpack 3，在 Node 17+ 上可能报 `ERR_OSSL_EVP_UNSUPPORTED`，可用：

```bash
NODE_OPTIONS=--openssl-legacy-provider npm start
```

## 环境变量

配置位于 `.env`（已被 `.gitignore` 忽略），模板见 `.env.example`。变量在启动/构建时注入，修改后需重启开发服务器。

| 变量 | 说明 |
| --- | --- |
| `REACT_APP_HA_API_URL` | HA REST API 根地址，必须包含 `/api`，例如 `http://homeassistant.local:8123/api` |
| `REACT_APP_HA_API_TOKEN` | HA 长期访问令牌，所有请求使用 `Authorization: Bearer <token>` |
| `REACT_APP_HA_WEATHER_ENTITY_ID` | 室外天气实体（`weather.*`） |
| `REACT_APP_HA_INDOOR_AQI_ENTITY_ID` | 室内空气质量传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_TEMPERATURE_ENTITY_ID` | 室内温度传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_HUMIDITY_ENTITY_ID` | 室内湿度传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_PRESSURE_ENTITY_ID` | 室内气压传感器（`sensor.*`） |

不要在代码中硬编码新的 URL、令牌或实体 ID，统一走环境变量。`src/actions/bingWallpaper.js` 中的 `http://start.home.lan:8083/proxy/` 是已知的硬编码例外。

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

`App.js` 在 `componentWillMount` 中发起首次加载，在 `componentDidMount` 中设置定时器：

- 时钟：每 1 秒（`CLOCK_TICK` 被 redux-logger 过滤，不打印）
- 室内空气质量 / 室内天气：每 5 分钟
- 室外空气质量 / 室外天气：每 30 分钟
- Bing 壁纸：每 12 小时

### HA REST API 用法

| 用途 | 请求 |
| --- | --- |
| 读取实体状态 | `GET {apiURL}/states/{entity_id}` |
| 模板渲染（室内温湿度/气压/AQI） | `POST {apiURL}/template`，body 为 `{ "template": "..." }` |
| 天气逐日预报 | `POST {apiURL}/services/weather/get_forecasts?return_response` |
| 灯光控制 | `POST {apiURL}/webhook/{hook_name}`（`turn_off_all_lights`、`toggle_door_light`） |

所有请求都带 `Authorization: Bearer ${REACT_APP_HA_API_TOKEN}` 和 `Content-Type: application/json`。

### 数据形状与已知细节

- 室外天气组件期望 `state.outdoorWeather.now = { code: '200', now: {...} }`；`code !== '200'` 时不渲染。
- 室外天气属性使用 `qweather_icon`、`condition_cn`、`windscale` 等 HA 集成字段。
- 预报接口的响应在 `service_response["weather.tian_qi"].forecast` 下。
- 室内 AQI reducer 会把 `unavailable` / `unknown` 视为无效值，保留上一次有效读数并设置 `isStale: true`，组件据此显示离线提示。
- `src/actions/indoorAirQuality.js` 和 `indoorWeather.js` 的模板中，`LastUpdate` 硬编码读取 `sensor.weatherstation_livingroom_temperature.last_changed`；更换设备时需同步修改。
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
