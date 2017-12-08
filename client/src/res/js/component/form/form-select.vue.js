(function(componentName) {
    var html =
    '<label class="field select"> \
        <select ref="select" v-bind:id="[[name]]" v-bind:name="[[name]]" v-model="currentValue" > \
            <option v-for="option in data" v-bind:value="option.value"> \
                [[ option.text ]] \
            </option> \
        </select> \
        <i class="arrow double"></i> \
     </label>';

    var opt = {
        template:html,
        props: {
            name:String,
            value:String,
            data:Array,
            icon:String,
            rule:Object
        },
        data: function() {
            return {
                inited: false,
                currentValue:this.value
            };
        },
        watch:{
            value(val){
                //设置监听，如果改变就更新 currentValue
                this.currentValue = val;
            },
            currentValue(val){
                //设置监听，如果改变就更新 value
                this.$emit('update:value', val)
            }
        },
        mounted: function() {
            if (!this.inited && this.rule) {
                for (var key in this.rule) {
                    this.$refs.select.setAttribute('data-rule-' + key, this.rule[key]);
                }
            }
            this.inited = true;
        }
    };
    Vue.component(componentName, opt);
})('form-select');