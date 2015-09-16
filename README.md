# postcss-pxtorem

### 移动端px to rem

例如设计师给出640px的设计稿，写css样式的时候，就按照640px切图，单位px。
完工后，js或者css媒体查询，设定1rem的值。例如1rem == 40px。那么我们只
需要把css文件里面的px换算成rem就行。 而不需要在切图的过程中换算成rem。

### 安装

    git clone git@github.com:Aralic/postcss-pxtorem.git

### 初始化

    npm install
    node index.js init

当前目录生成pxtorem.json 配置文件

    {
        //待处理文件or路径 相对路径
        "files": ["./css/a.css", "./css/"],
        //默认根目录字体大小(px)
        "root_value": 20,
        //保留小数位
        "unit_precision": 5,
        //需要换算的属性,支持CSS属性，不限以下
        //"font", "font-size", "line-height", "letter-spacing"
        "prop_white_list": ["width", "height", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"],
        //布尔值，是否替换掉属性值
        //默认直接替换属性
        "replace": true,
        //布尔值，是否替换media screen中的属性值
        //例如“@media screen and (max-width:240px)”
        "media_query": 
    }

### 执行

    node index.js build 

### TIPS

对css文件只匹配了小写的px，如果需要不转换pxtorem，则可以在书写css的时候，大写PX，这样浏览器是支持的。

### 参考

    https://github.com/stormtea123/viewtorem
    https://github.com/cuth/postcss-pxtorem

### 预期功能

1. 生成的文件，从当前目录剥离出来，再根目录新建output文件夹，生成的文件输出到这个文件夹
2. 缓存优化，已编译输出，但再未修改过的文件不再编译。提升性能。
