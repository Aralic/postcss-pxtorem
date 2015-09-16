/**
*
* @file     pxtorem转换
* @author   aralic(aralic@163.com)
* @date     2015-09-14
*/
var postcss = require('postcss');

module.exports = postcss.plugin('postcss-pxtorem', function(opts) {

    return function(css, result) {
        var prop_white_list = opts.prop_white_list;
        var root_value = opts.root_value;
        var precision = opts.unit_precision;
        var optsReplace = opts.replace;
        var regex = /(\d+)?(\.)?\d+px/;
        var mediaReplace = opts.media_query;
        // 替换规则
        var toReplace = function(string) {
            var value = parseFloat(string);
            return toFixed(value/root_value, precision) + 'rem';
        }
        // 直接rem替换原有属性值px
        if (optsReplace) {
            css.replaceValues(regex, { fast: 'px' , props: prop_white_list}, toReplace);
        } else {
            // 保留原有属性，兼容不支持rem的浏览器
            css.walkDecls(function(decl) {
                var prop = decl.prop;
                if (!prop_white_list.length) return;
                if (prop_white_list.indexOf(prop) === -1) return;
                decl.cloneBefore({prop: prop});
                decl.value = decl.value.replace(regex, toReplace);
            });

        }
        
        // 针对媒体查询media条件pxtorem
        if (mediaReplace) {
           css.walkAtRules(function(rule) {
               if (rule.name === 'media' && rule.type === 'atrule') {
                   rule.params = rule.params.replace(regex, toReplace);
               }
           }); 
        }
    }
});

// 保留小数点位数
function toFixed(number, precision) {
    var multiplier = Math.pow(10, precision + 1),
        wholeNumber = Math.floor(number * multiplier);
    return Math.round(wholeNumber / 10) * 10 / multiplier;
}

