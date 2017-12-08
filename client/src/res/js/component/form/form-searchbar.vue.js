(function(componentName) {
    var html =
    '<div ref="root" class="smart-widget"> \
        <label :class="icon ? \'field prepend-icon\' : \'field\'"> \
            <input ref="input" \
                   v-bind:type="[[type]]" v-bind:name="[[name]]" v-bind:id="[[name]]" class="gui-input" v-bind:placeholder="[[placeholder]]"> \
            <label v-if="icon" v-bind:for="[[name]]" class="field-icon"> \
                <i v-bind:class="[[icon]]"></i> \
            </label> \
        </label> \
        <button ref="btn" type="button" v-bind:class="[[btnClass]]">[[btnText]]</button> \
     </div>';

    var opt = {
        template:html,
        props: {
            name:String,
            value:String,
            data:Array,
            direction:{ type:String, default:"right" },
            placeholder:String,
            type:{ type:String, default:"text" },
            icon:{ type:String, default:'fa fa-search' },
            rule:Object,
            btnWidth:{ type:String, default:"80" },
            btnText:{ type:String, default:'Search' },
            btnClass:{ type:String, default:'button btn-danger' }
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
            if (!this.inited) {
                if (this.rule) {
                    for (var key in this.rule) {
                        this.$refs.input.setAttribute('data-rule-' + key, this.rule[key]);
                    }
                }
                var directionStyle = '';
                this.$refs.btn.style.width = this.btnWidth + 'px';
                if (this.direction == 'left') {
                    directionStyle = 'sm-left';
                    this.$refs.root.style['padding-left'] = this.btnWidth + 'px';
                } else {
                    directionStyle = 'sm-right';
                    this.$refs.root.style['padding-right'] = this.btnWidth + 'px';
                }
                this.$refs.root.className = this.$refs.root.className + ' ' + directionStyle;
            }
            this.inited = true;
        }
    };
    Vue.component(componentName, opt);
})('form-searchbar');