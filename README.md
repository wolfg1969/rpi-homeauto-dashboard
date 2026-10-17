# Homeauto Dashboard

显示室内外天气及空气质量，数据来源：~~和风天气 API、本地 Domoticz API~~ 本地 HA Rest API

## 本地开发

安装依赖：

```
npm install
```

配置环境变量：

```
cp .env.example .env
```

然后编辑 `.env`，填入 Home Assistant 的地址、令牌和实体 ID：

| 变量 | 说明 |
| --- | --- |
| `REACT_APP_HA_API_URL` | Home Assistant REST API 根地址，必须包含 `/api`，例如 `http://homeassistant.local:8123/api` |
| `REACT_APP_HA_API_TOKEN` | 长期访问令牌，在 HA 的「个人资料 → 安全 → 长期访问令牌」中创建 |
| `REACT_APP_HA_WEATHER_ENTITY_ID` | 室外天气实体（`weather.*`），需提供 `qweather_*` 等属性 |
| `REACT_APP_HA_INDOOR_AQI_ENTITY_ID` | 室内空气质量传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_TEMPERATURE_ENTITY_ID` | 室内温度传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_HUMIDITY_ENTITY_ID` | 室内湿度传感器（`sensor.*`） |
| `REACT_APP_HA_INDOOR_PRESSURE_ENTITY_ID` | 室内气压传感器（`sensor.*`） |

`REACT_APP_*` 变量在启动/构建时注入，修改 `.env` 后需要重启开发服务器。`.env` 已被 `.gitignore` 忽略，请勿提交。

启动开发服务器：

```
npm start
```

浏览器访问 <http://localhost:3000>。

生产构建：

```
npm run build
```

构建产物位于 `build/` 目录（`package.json` 中 `homepage` 为 `"./"`）。

> 必应壁纸代理地址在 [src/actions/bingWallpaper.js](src/actions/bingWallpaper.js) 中硬编码为 `http://start.home.lan:8083/proxy/`，服务器地址或端口不同时需同时修改该文件。
>
> 页面底部的「一键关灯」「玄关灯」按钮会调用 HA webhook：`turn_off_all_lights`、`toggle_door_light`，需要在 HA 中创建同名自动化。

服务端配置（可以在同一个树莓派上运行）：
Nginx 正向代理配置用于获取必应壁纸，避免 CORS 错误；发布 React 应用。

树莓派配置：

安装 xinput 和 unclutter
```
$ apt-get install xinput unclutter
```

```/boot/config.txt``` 添加 ```display_rotate=1``` 设置为竖直显示。

```
#!/bin/bash
# script to set correct touchscreen orientation after x start
# this won't rotate the displayed image, only the touchscreen input
# to rotate the displayed image add the following to /boot/config.txt
# "display_rotate=1" to rotate display 90 degrees
# "display_rotate=3" to rotate display 270 degrees
xinput list  # check "Virtual core pointer"
xinput --set-prop 'FT5406 memory based driver' 'Coordinate Transformation Matrix'  0 1 0 -1 0 1 0 0 1  # 90 degrees right
# 0 -1 1 1 0 0 0 0 1 # 90 degrees left
```

```~/.local/bin/run-dashboard.sh```
```
#!/bin/bash
xinput --set-prop \
  'FT5406 memory based driver' \
  'Coordinate Transformation Matrix' \
  0 -1 1 1 0 0 0 0 1 # 90 degrees left(270 degress clockwise)
/usr/bin/chromium-browser --kiosk --incognito \
  http://start.home.lan:8083/dashboard/ &
```


设置自动启动浏览器 Dashboard 页面

```
$ nano ~/.config/autostart/browserAuto.desktop
[Desktop Entry]
Type=Application
Exec=/home/pi/.local/bin/run-dashboard.sh
Hidden=false
X-GNOME-Autostart-enabled=true
Name=HomeDashboard
```

禁用屏幕保护程序
```
$ sudo nanoca /etc/lightdm/lightdm.conf
[SeatDefaults]
xserver-command=X -s 0 dpms
```

隐藏浏览器界面，只显示 Dashboard 页面
```
$ nano ~/.config/autostart/unclutterAuto.desktop
[Desktop Entry]
Type=Application
Exec=unclutter -idle 0.1
```

* https://www.raspberrypi.org/forums/viewtopic.php?f=108&t=120793
* https://www.raspberrypi.org/forums/viewtopic.php?t=172025
* https://superuser.com/questions/461035/disable-google-chrome-session-restore-functionality
* https://github.com/facebookincubator/create-react-app/issues/1094
* https://forums.raspberrypi.com/viewtopic.php?t=11815

![dashboard-screenshot](https://github.com/wolfg1969/rpi-homeauto-dashboard/assets/1585718/e0af8ab2-3f57-4a09-a076-a235170bb5e3)

  
