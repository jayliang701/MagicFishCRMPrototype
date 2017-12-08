(function(componentName) {
    var html =
    '<label v-bind:for="[[name]]" :class="icon ? \'field prepend-icon\' : \'field\'"> \
        <input ref="input" \
               v-bind:type="[[type]]" v-bind:name="[[name]]" v-bind:id="[[name]]" class="gui-input" \
               v-bind:placeholder="[[placeholder]]" v-bind:value="[[currentValue]]" \
               @input="updateValue" > \
            <label v-if="icon" v-bind:for="[[name]]" class="field-icon"> \
                <i v-bind:class="[[icon]]"></i> \
            </label> \
            <span v-if="loading" class="loading-spinner"></span> \
    </label>';

    var opt = {
        template:html,
        props: {
            name:String,
            value:String,
            placeholder:String,
            icon:String,
            type:{ type:String, default:"text" },
            asyncCheck:Function,
            rule:Object
        },
        data: function() {
            return {
                currentValue: this.value,
                inited: false,
                loading: false
            };
        },
        methods: {
            updateValue: function(e) {
                var val = e.target.value;
                this.$emit('update:value', val);
                this.$emit('change', val);
            },
            showLoading: function() {
                this.loading = true;
            },
            stopLoading: function() {
                this.loading = false;
            }
        },
        mounted: function() {
            if (!this.inited) {
                if (this.rule) {
                    for (var key in this.rule) {
                        this.$refs.input.setAttribute('data-rule-' + key, this.rule[key]);
                    }
                }
                this.$refs.input.showLoading = this.showLoading.bind(this);
                this.$refs.input.stopLoading = this.stopLoading.bind(this);
            }
            this.inited = true;
        }
    };
    Vue.component(componentName, opt);
})('form-input');