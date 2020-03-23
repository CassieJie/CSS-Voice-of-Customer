# CSS Voice of Customer

This project is a web app for *CSS Voice of Customer* based on Bootstrap,Node.js, Express and MongoDB. Include a honor wall web page and a background management system.


## 一、Deploy Environment
**1. Software Requirements**： Node.js +Express( a framework for Node.js )+ MongoDB

**2. Download & Add Environment Path：**

- Download Node.js - v12.15.0 : https://nodejs.org/download/release/v12.15.0/
- Download MongoDB - v3.2.22 : https://www.mongodb.com/download-center/community
- Add two installation paths to System Environment Variables.

**3. Start up MongoDB**

1. Open a command window and switch to the "bin" directory under the mongodb installation directory
   	```
  	 F:
   	cd mongodb-win32-x86_64-2008plus-ssl-3.2.22\bin
   	```
2. Create storage path(data path and log path) to store MongoDB data and log

   	```
  	 cd ..\
   	mkdir data\log
   	cd data\log
   	type nul>mongodb.log           //create log file is necessary otherwise an error
   	```
3. Start up MongoDB Server
   	```
   	cd ..\..\bin
  	mongod --dbpath F:\mongodb-win32-x86_64-2008plus-ssl-3.2.22\data
   	```

## 二、Project structure

![tree](https://github.com/CassieJie/learngit/blob/master/Project_voc/tree.jpeg)

* **Entry file**: app_v2_module.js

* **Resource directory**: public

* **Database backup**: honor.json / engineer.json

  

## 三、Install project

**1. Install npm dependencies after installing project (Git or manual import)**

```
cd project_voc
npm install
```

**2. Import database**
honor.json: back up of case data
Engineer.json: back up of Engineer data

```
F:
cd mongodb-win32-x86_64-2008plus-ssl-3.2.22\bin
mongoimport -d CSSDataManage -c honor --file D:\project_voc\honor.json --type json
mongoimport -d CSSDataManage -c engineer --file D:\project_voc\engineer.json --type json
```

**3. Start up project sever**

```
cd project_voc
node app_v2_module.js 
```

## 四、Project Preview

```
open browser and input URL:
## Honor Wall web page
http://localhost:3004/

## Background management system
http://localhost:3004/admin/Product

Login Username: admin
Login Passwd: devadmin
```

