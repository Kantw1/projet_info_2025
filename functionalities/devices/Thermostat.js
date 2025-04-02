(function () {
    const app = new Vue({
        el: '#thermostat-component',
        data: {
            dragging: false,
            thermostat: {
                name: 'Thermostat',
                temp: 22.3,
                target: 23.0,
                humidity: 54,
                energy: 66
            },
            minTemp: 10,
            maxTemp: 30,
            radius: 80
        },
        computed: {
            circumference() {
                return 2 * Math.PI * this.radius;
            },
            dashOffset() {
                const ratio = (this.thermostat.target - this.minTemp) / (this.maxTemp - this.minTemp);
                return this.circumference * (1 - ratio);
            }
        },
        methods: {
            startDrag(e) {
                this.dragging = true;
                this.updateTemperature(e);
            },
            onDrag(e) {
                if (this.dragging) {
                    this.updateTemperature(e);
                }
            },
            endDrag() {
                this.dragging = false;
            },
            updateTemperature(e) {
                const svg = e.currentTarget;
                const rect = svg.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                angle = (angle + 360 + 90) % 360;
                const temp = this.minTemp + (angle / 360) * (this.maxTemp - this.minTemp);
                this.thermostat.target = Math.round(temp);
            }
        }
    });
})();
