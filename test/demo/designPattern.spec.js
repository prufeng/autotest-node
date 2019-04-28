
describe('Javascript Design Pattern', () => {

    it('Strategy Design Pattern - Interface', () => {
        const HelloWork = function (travelStrategy) {
            this.travelStrategy = travelStrategy;

            this.setTravelStrategy = function (travelStrategy) {
                this.travelStrategy = travelStrategy;
            };
            this.travel = function () {
                let strategy = this.travelStrategy();
                console.log(`${strategy}上班`);
            };
        };

        const walking = () => {
            return '我穷我走路';
        };
        const subway = () => {
            return '我土豪我搭几个亿的地铁';
        };
        const bike = () => {
            return '我环保我开新能源机动车（小电瓶）';
        };

        const hw = new HelloWork(walking);
        hw.travel();

        hw.setTravelStrategy(bike);
        hw.travel();

        hw.setTravelStrategy(subway);
        hw.travel();
    });

});