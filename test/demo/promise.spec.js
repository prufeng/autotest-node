describe('Promise Test', () => {

    it('Promise hello world', (done) => {
        const myPromise1 = function (param) {
            return new Promise((resolve, reject) => {
                console.log('myPromise1 is running');
                setTimeout(() => {
                    if (param) {
                        resolve('promise1');
                    } else {
                        reject(new Error('Oops!'));
                    }
                }, 0);
            });
        };

        const myPromise2 = function (param) {
            return new Promise((resolve, reject) => {
                console.log(`myPromise2 Param is ${param}`);
                // throw new Error('Oops!'); //5
                // reject(new Error('Oops!'));  //6
                // dummyFunc(); //7 not defined
                setTimeout(() => resolve('promise2'), 50);
            }).catch((err) => {
                console.log('catch Exception in myPromise2');
                console.log(err);
                throw new Error('Oh No!'); //8
            });
        };

        const myPromise3 = function (param) {
            setTimeout(() => {
                console.log(`myPromise3 Param is ${param}`);
                throw new Error('Oops!'); //1
            }, 450); //2
        };

        const myPromise4 = function (param) {
            return new Promise((resolve, reject) => {
                console.log(`myPromise4 Param is ${param}`);
                setTimeout(() => resolve('promise4'), 50);
            });
        };

        myPromise1(1) //4
            .then(myPromise2)
            .then(myPromise3)
            .then(myPromise4)
            .then(ret => {
                console.log(`final block return ${ret}`);
            }).catch(err => {//3
                console.log('catch Exception in the end');
                console.log(err);
            }).then(() => {
                console.log('then after catch');
            }).finally(() => myPromise4('finally')).then(() => {
                console.log('then after finally');
                done();
            });

    });
});