// 引入模块
var fs = require('fs'),
    path = require('path'),
    postcss = require('postcss'),
    util = require('util'),
    pxtorem = require('./postcss-pxtorem.js');

var BASE_DIR = __dirname,
    ARGV = process.argv,
    CONFIG = {
        "files": ["./css/a.css"],
        "root_value": 20,
        "unit_precision": 5,
        "prop_white_list": ["width", "height"],
        "replace": true,
        "media_query": false
    }

ARGV.shift();

if (ARGV.length >= 2 && ARGV[1] === 'init') {
    init();
} else if (ARGV.length >= 2 && ARGV[1] === 'build') {
    dealFile();
} else {
    console.error('command node index.js init or node index.js build');
}

// 初始化，如果当前目录不存在pxtorem.json
// 则生成此文件
function init() {
    var promise = new Promise(function(resolve, reject) {
        fs.exists(
            BASE_DIR + '/pxtorem.json',
            function(bool) {
                bool === false ? resolve() : reject();
            }
        );
    });

    promise.then(function() {
        fs.writeFile(
            BASE_DIR + '/pxtorem.json',
            JSON.stringify(CONFIG, null, 4),
            function(err) {
                if (err) throw err;
                console.log('create pxtorem.json success')
            }
        );
    });
}

// 根据配置文件，动态生成css文件
function dealFile() {
    var exist = fs.existsSync(BASE_DIR + '/pxtorem.json');
    if (!exist) {
        console.log('error, pxtorem.json file not exist! please command node index.js init');
        return;
    }

    var opts = require('./pxtorem.json');
    var opts_files = opts.files;
    if (util.isArray(opts_files) && opts_files.length > 0) {
        var arr = [];
        opts_files.forEach(function(item) {
            // 当路径后缀是CSS时才读取
            if ((/.css$/ig).test(item)) {
                arr.push(transFile(path.join(BASE_DIR, item)));
            } else {
                console.error(item + '----file not exist');
            }
        });
        Promise.all(arr).then(function() {
            console.log('all task done!')
        });
    } else {
        console.log('please write files in pxtorem.json files');
        return;
    }

    // 读取在配置项里面的文件路径
    // 依次转换CSS文件
    function transFile(filePath) {
        return new Promise(function(resolve, reject) {
            fs.readFile(
                filePath,
                'utf8',
                function(err, data) {
                    if (err) reject(err);
                    resolve(data);
                }
            );
        }).then(function(css) {
            return postcss([pxtorem(opts)]).process(css).then(function(result) {
                var filaName = path.basename(filePath, 'css');
                var fileDirname = path.dirname(filePath);
                var newFile = path.join(fileDirname, 'torem-'+filaName+'css');
                return new Promise(function(resolve, reject) {
                    fs.writeFile(
                        newFile,
                        result.css,
                        'utf8',
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                }).then(function() {
                    console.log('torem-'+filaName+ 'css' + '  create success!');
                });
            });
        }, function(err) {
            console.error(err);
        });
    }
}