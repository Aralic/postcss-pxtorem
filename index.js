/**
*
* @file     pxtorem转换
* @author   aralic(aralic@163.com)
* @date     2015-09-14
*/

// 引入模块
var fs = require('fs'),
    path = require('path'),
    postcss = require('postcss'),
    util = require('util'),
    pxtorem = require('./postcss-pxtorem.js');

var BASE_DIR = __dirname,
    ARGV = process.argv;

/**
 * hash表，用于对push到fileArr数组的待操作文件去重
 * @type {Object}
 */
var map = {};
/**
 * 待操作文件列表，数组项为路径文件名
 * @type {Array}
 */
var fileArr = [];
// 配置项，生成pxtorem.json文件
var CONFIG = {
    "files": ["./css/a.css"],
    "root_value": 20,
    "unit_precision": 5,
    "prop_white_list": ["width", "height"],
    "replace": true,
    "media_query": false
}
if (ARGV.length >= 3 && ARGV[2] === 'init') {
    // node index.js init
    init();
} else if (ARGV.length >= 3 && ARGV[2] === 'build') {
    // node index.js build
    build();
} else {
    console.error('please command node index.js init or node index.js build');
}
// 初始化操作
// 如果当前目录不存在pxtorem.json配置文件
// 则由此CONFIG配置生成文件
function init() {
    var promise = new Promise(function(resolve, reject) {
        fs.exists(
            BASE_DIR + '/pxtorem.json',
            function(bool) {
                // bool为false 文件不存在 启用resolve
                bool ? reject() : resolve();
            }
        );
    });
    promise.then(function() {
        fs.writeFile(
            BASE_DIR + '/pxtorem.json',
            JSON.stringify(CONFIG, null, 4),
            function(err) {
                if (err) reject(err);
                console.log('create pxtorem.json success')
            }
        );
    }, function() {
        console.log('pxtorem.json file exist!!!\nplease command node index.js build');
    }).catch(function(err) {
        console.log(err);
    });
}
// 根据配置文件，动态生成css文件
function build() {
    if (isExistsFile('/pxtorem.json')) {
        var opts = require('./pxtorem.json');
        initOpts(opts);
    } else {
        console.error('error,file not exist!');
    }

}
/**
 * 对配置的文件进行初始化操作
 * @param  {Object} opts pxtorem.json文件内容
 * @return {null}
 */
function initOpts(opts) {
    var optsFiles = opts.files;
    var promisePath = [];
    
    if (util.isArray(optsFiles)
        && optsFiles.length > 0) {
        // 从配置文件提取需要转换的css文件
        // push到fileArr数组中
        fileArr = optsFiles.
        filter(function(item) {
            return path.extname(item) === '.css';
        }).
        map(function(file) {
            file = path.join(BASE_DIR, file);
            map[file] = true;
            return file;
        });
        // 从配置文件提取需要转换的路径名
        // 读取路径命下面的所有css文件
        // 并把css文件push到fileArr数组中
        // 过滤到重复的css文件
        // 返回新数组[promise, promise]
        promisePath = optsFiles.
        filter(function(item) {
            return path.extname(item) === '';
        }).
        map(function(dir) {
            return readDir(dir);
        });
        allDone(promisePath, opts);
    } else {
        console.log('please write filepathname in pxtorem.json files []');
        return;
    }
}

/**
 * 读取当前目录下面的所有文件，选取css文件
 * @param  {string} dir 目录路径
 * @return {Object}     promise对象
 */
function readDir(dir) {
    var promise = new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            if (err) reject(err);
            resolve(files);
        });
    });

    promise = promise.then(function(files) {
        // 当文件名不含有torem-
        // 并且是CSS文件，把文件push到fileArr数组中
        files.
        filter(function(file) {
            return path.extname(file) === '.css' && file.indexOf('torem-') === -1;
        }).
        map(function(file) {
            return path.join(BASE_DIR, dir, file);
        }).
        forEach(function(file){
            if (!map[file]) {
                fileArr.push(file);
                map[file] = true;
            }
        });
    });

    return promise;
}
// 读取在配置项里面的文件路径
// 依次转换CSS文件
// 编译输出
function complie(filePath, opts) {
    var promise = new Promise(function(resolve, reject) {
        fs.readFile(
            filePath,
            'utf8',
            function(err, data) {
                if (err) reject(err);
                resolve(data);
            }
        );
    })
    promise = promise.then(function(css) {
        // 调用postcss-pxtorem插件
        // 返回内容
        // 写入文件
        return postcss([pxtorem(opts)]).process(css).then(function(result) {
            var filename = path.basename(filePath, 'css');
            var fileDirname = path.dirname(filePath);
            var newFile = path.join(fileDirname, 'torem-'+filename+'css');
            return outFile(newFile, result.css);
        });
    });
    return promise;
}

// 编译好的内容写入文件
function outFile(filename, css) {
    var promise = new Promise(function(resolve, reject) {
        fs.writeFile(
            filename,
            css,
            'utf8',
            function(err) {
                if (err) reject(err);
                resolve();
            }
        );
    });
    promise = promise.then(function() {
        console.log(filename+ '  create success!');
    });
    return promise;
}

// all done 
function allDone(promisePath, opts) {
    // 监听所有的css文件编译，当全部完成触发
    Promise.all(promisePath).then(function() {
        // 读取完路径并且push转换文件函数到数组arr中 
        var eventQueen = [];
        eventQueen = fileArr.map(function(file) {
            return complie(file, opts);
        });
        Promise.all(eventQueen).then(function() {
            console.log('all task done!')
        });

    });
}
// 判断配置文件是否存在
function isExistsFile(filePath) {
    filePath = path.join(BASE_DIR, filePath);
    var exist = fs.existsSync(filePath);
    if (!exist) {
        return false;
    } else {
        return true;
    }
}