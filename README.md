# Homeauto Dashboard

显示室内外天气及空气质量，数据来源：~~和风天气 API、本地 Domoticz API~~ 本地 HA Rest API

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

  
