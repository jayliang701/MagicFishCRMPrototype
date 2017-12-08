/**
 * Created by Jay on 2017/12/7.
 */
var Validator = (function() {

    // 大陆手机号码验证
    $.validator.addMethod("cnphone", function(value, element) {
        var length = value.length;
        var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, "请填写正确的手机号码");

    function use(formEle, option) {
        option = option || {};
        option.rules = option.rules || {};
        option.messages = option.messages || {};
        if (typeof formEle == 'string' || formEle instanceof Element) formEle = $(formEle);
        var defaultConfig = {

            /* @validation states + elements
             ------------------------------------------- */

            errorClass: "state-error",
            validClass: "state-default",
            errorElement: "em",

            /* @validation rules
             ------------------------------------------ */

            rules: {
            },

            /* @validation error messages
             ---------------------------------------------- */

            messages: {
                email: {
                    required: 'Enter email address',
                    email: 'Enter a VALID email address'
                },
                phone: {
                    required: 'Enter your website URL',
                    url: 'URL should start with - http://www'
                }
            },

            /* @validation highlighting + error placement
             ---------------------------------------------------- */

            highlight: function(element, errorClass, validClass) {
                $(element).closest('.field').addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).closest('.field').removeClass(errorClass).addClass(validClass);
            },
            errorPlacement: function(error, element) {
                if (element.is(":radio") || element.is(":checkbox")) {
                    element.closest('.option-group').after(error);
                } else {
                    error.insertAfter(element.parent());
                }
            }

        };
        formEle.find('input[required]').each(function () {
            var name = $(this).attr('name');
            option.rules[name] = { required:true };
        });
        formEle.find('[required-text]').each(function () {
            var name = $(this).attr('name');
            var requiredText = $(this).attr('required-text');
            option.messages[name] = option.messages[name] || {};
            option.messages[name].required = requiredText || (defaultConfig.messages[name] ? (defaultConfig.messages[name].required || "Required") : "Required");
        });
        defaultConfig.rules = Object.assign({}, defaultConfig.rules, option.rules);
        defaultConfig.messages = Object.assign({}, defaultConfig.messages, option.messages);
        return formEle.validate(Object.assign({}, defaultConfig, option));
    }

    return {
        use:use
    };

})();