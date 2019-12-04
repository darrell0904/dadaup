# 来，一起撸一个 Promise



### 一，promise的作用以及由来





### 二，先来一个简易的promise
刚开始我们要明白的几个问题：

```
class MyPromise {
  static PENDING = 'pending';
  static RESOLVED = 'resolved';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = null;
    this.reason = null;

    this.resolvedQueues = [];
    this.rejectedQueues = [];

    let resolve = (val) => {
      if (this.status == MyPromise.PENDING) {
        this.value = val;
        this.status = MyPromise.RESOLVED;
        this.resolvedQueues.forEach(cb => cb(this.value))
      }
    }

    let reject = (reason) => {
      if (this.status == MyPromise.PENDING) {
        this.reason = reason;
        this.status = MyPromise.REJECTED;
        this.rejectedQueues.forEach(cb => cb(this.reason))
      }
    }

    try{
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
}
```



* promise 是一个 类，类中包含相关的 成功的 `value`、错误的 `reason`，成功的方法回调数组`resolvedQueues`，失败的方法回调数组`rejectedQueues`、promise 的 状态 `status`


* Promise 有 三个状态，pending、resolved、rejected，状态的改变只有从 pending 变到 resolved 或者 rejected，这个过程是不可逆的，状态改变了之后，就不会在进行变化了
* Promise 需要传入一个函数 `executor`，这个函数的参数 有两个参数 `resolve`、`reject` 成功回调 和错误回调，把状态改变的控制权交给使用者，让使用者通过这两个参数来改变promise的状态



接下去我们实现 then 方法：

```
class MyPromise {
    ......
    
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err}

        if (this.status === MyPromise.PENDING) {
           this.resolvedQueues.push(onFulfilled)
           this.rejectedQueues.push(onRejected)
        }
        if (this.status === MyPromise.RESOLVED) {
           onFulfilled(this.value)
        }
        if (this.status === MyPromise.REJECTED) {
           onRejected(this.reason)
        }
    }
}
```

* 首先判断两个传入的参数是否是函数，因为这两个都是可选参数，因此我们这边要给他定义的函数，这也是在promise 中实现透传的原因
* 接着我们根据相关的状态去执行相应的操作，如果是等待态，就需要把成功或者失败函数push 到相应的数组中去，如果是成功态，那么就直接处理成功的函数；失败也是一样。





### 三，实现 promise 的链式调用

对于同步任务来说，我们只需要在 `then` 处加上一行代码就能实现 链式调用：

```
...
	then(onFulfilled, onRejected) {
        ...
        
        return this;
	}
...
```



但是我们通过例子可以发现：

```
var p1 = new MyPromise((resolved, rejected) => {
	resolved(100);
})

p1.then(res => {
	console.log('---res1---', res);
	return 2;
}, err => {
	console.log('---err1---', err);
}).then(res => {
	console.log('---res2---', res);
	return 1;
})
```



我们可以看到这里打印 res1 和 res2 其实都被 100；



我们其实期望的是res1 输出100，res2 输出 2；在上面这个例子中，p1.then() 返回的是p1这个实例本身，所以在调用第二个 then 



实际的promise.then() 返回的是，一个新的promise 并把更在他之后的 then方法 放在 promise.then() 这个 promise 的回调函数里面。



### 四，实现一个 包含异步回调的 promise



```
then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err}

    let promise2;

    if (this.status === MyPromise.RESOLVED) {
      return promise2 = new MyPromise((resolved, rejected) => {
        try {
          let x = onFulfilled(this.value);
          resolvePromise(promise2, x, resolved, rejected);
        } catch(err) {
          rejected(err);
        }
      })
    }

    if (this.status === MyPromise.REJECTED) {
      return promise2 = new MyPromise((resolved, rejected) => {
        try {
          let x = onRejected(this.reason);
          resolvePromise(promise2, x, resolved, rejected);
        } catch(err) {
          rejected(err);
        }
      })
    }

    if (this.status === MyPromise.PENDING) {
      return promise2 = new MyPromise((resolved, rejected) => {
          this.resolvedQueues.push(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolved, rejected);
            } catch(err) {
              rejected(err);
            }
          })

          this.rejectedQueues.push(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolved, rejected);
            } catch(err) {
              rejected(err);
            }
          })
      })
    }
  }
```



这里涉及到一个问题，就是通过 then 的 `onFulfilled` 或者 `onRejected` 函数返回的值，还是一个 promise 对象的时候，我们需要等待这个新的promise 对象 成功 或者失败之后，在能改变 then() 这个promise 的状态，

因此这里创建了一个函数，用来处理相应的这些情况

```
function resolvePromise(promise2, x, resolved, rejected) {
  if (x instanceof MyPromise) {
    if (x.status = MyPromise.PENDING) {
      x.then(y => {
        resolvePromise(promise2, y, resolved, rejected);
      }, err => {
        rejected(err);
      })
    } else {
      x.then(resolved, rejected);
    }
  } else {
    resolved(x);
  }
}
```

* 当 x为promise 对象的时候， 并且他的状态是等待状态的时候，就等待这个 新的promise 完成，再去执行接下来的操作，这里用到了一个递归；当他的状态是成功的状态的时候，就直接执行x的then方法，并把promise2 的  `resolved` 和 `rejected`传入
* 当 x 是普通值的时候，就直接执行 resolve



### 五，跟着规范文档完善，promise

首先跟着我一起打开 [promise规范文档](https://promisesaplus.com/)

接下去我们对promise 规范的主要工作几乎都是在  `resolvePromise` 这个函数体中完成的。



刚刚我们完成的 promise 中 有几个 需要根据规范修改一下：

* 当 x 和 promise2 是相同的对象，那么`promise`则以拒绝`TypeError`为理由。 （2.3.1）


```
// resolvePromise

function resolvePromise{
    if(x === promise2){
    	return rejected(new TypeError('Chaining cycle detected for promise'));
  	}
  	
  	...
}
```



> 自己等待自己完成，是永远不可能完成的，总有一个函数要去调用一下  promise2 的 成功或者失败函数



* 当 x 是一个 promise ，那么就 等待 x 改变状态之后，才算 完成或者失败（这个也属于第三条，因为promise 其实也是一个 thenable 对象）
* 当 x 是一个对象 或者 函数的时候，就是 （thenable对象），那就那 x.then 作为 then
* 当promise 的状态改变了之后，就再也不会在改变了


```
// resolvePromise 函数体内

let called = false;

if (x != null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolved, rejected)
        }, err => {
          if(called)return;
          called = true;
          rejected(err);
        })
      } else {
        resolved(x);
      }
    } catch(err) {
      if (called) return;
      called = true;
      rejected(err);
    }
}
```

> 1. 我们之所以可以把以上两个放在一起，其实是因为，promise 也是一个 thenable 对象
>
> 2. 首先我们判断 x  是不是 一个 对象 或者函数 ，并且他不为空的的时候，我们去拿 x 的 then 属性，如果他是一个函数：那就说明他是一个 thenable 对象，类似于 `promise` 或者下面这种。
>
>    ```
>    // thenable 对像
>    {
>        then: function(resolve, reject) {
>            setTimeout(() => {
>                resolve('我是thenable对像！！！')
>            })
>        }
>    }
>    ```
>
>    当 then 是一个函数之后，我们就去调用 他的 then 方法，知道他不在是一个 thenable 对象 位置。
>
>    为了更加直观的理解这个概念，我们拿一个例子来分析：
>
>    ```
>    var p1 = new MyPromise((resolved, rejected) => {
>            setTimeout(() => {
>              resolved('---p1---');
>          }, 1000); 
>    })
>
>    var p2 = function(data) {
>          console.log(data);
>          return new MyPromise((resolved, rejected) => {
>              setTimeout(() => {
>                resolved('---p2---');
>              }, 1000); 
>          });
>    }
>
>    var error = function(error) {
>          console.log('---error---');
>          return error
>    }
>
>    p1.then(p2, error);
>    ```
>
>    在这里我们 new 了一个 p1，并写了成功回调p2和错误回调 error。当 1 s 之后，p1 执行了 他的resolve函数，即 将 `'---p1---'` 这个值作为了其 then 方法 成功函数的 参数，即 p2 的参数，所以p2 的参数 data 为  `'---p1---'`，但是 p2 返回了一个 新的promise 对象，所以在 `resolvePromise` 函数中的 x 为 promise 对象，所以他就进入了`if (typeof then === 'function') {}`这个 if 中，我们便调用他的 then 函数，如果成功，我们在递归调用  `resolvePromise` 函数，因为 我们不知道 这个 `then` 后的值还是不是 thenable 对象，如果是，我们必须要等待其返回一个不是  thenable 对象，才能去改变promise2 的状态；如果失败，我们就直接调用 promise2 的 `reject` 函数。
>
> 3. 我们在外面定义了一个 called 占位符，就是为了获得这个 then 函数又没有执行过相应的改变状态的函数，执行过了之后，就不再去执行了。主要就是为了满足规范。
>
>    * 这里有两种情况，如果 x 是 promise 对象的话，其实当执行了`resolve` 函数 之后，就不会再执行 `reject` 函数了，是直接在当前这个pormise 对象就结束掉了。
>    * 当x 是普通的 thenable 函数的时候，他可能就有可能同时执行 `resolve` 和 `reject` 函数，即可以 同时执行promise2 的 resolve 函数 和 reject 函数，但是其实 `promise2` 在状态改变了之后，也不会再改变相应的值了。其实也没有什么问题。
>
>    还是之前的例子：
>
>        var p1 = new MyPromise((resolved, rejected) => {
>                setTimeout(() => {
>                  resolved('---p1---');
>              }, 1000); 
>        })
>        
>        var p2 = function(data) {
>          console.log(data);
>          // return new MyPromise((resolved, rejected) => {
>          //     setTimeout(() => {
>          //       resolved('---我要把它成功掉---');
>          //       rejected('---我要把它失败掉---');
>          //     }, 1000);
>          // });
>        
>          return {
>              then: function(resolve, reject) {
>                reject('我要把它失败掉')
>                resolve('我是thenable对像！！！');
>              }
>          }
>        }
>        
>        var error = function(error) {
>          console.log('---error---', error);
>          return error
>        }
>        
>        var p4 = function(data) {
>          console.log('---p4', data);
>        }
>        
>        p1.then(p2, error).then(p4, error);
>    我们看上面的例子，当`p2` 返回一个 `promise` 的时候，当他同时执行了 `resolved` 与 `rejected` 函数的时候，按照我们之前写的代码，回调函数队列，只有在 状态是 pending 的时候才会去执行的。
>
>    当 `p2` 放回一个 普通 `thenable` 对象的时候，因为没有状态的约束，所以两个函数都会执行，但好在 `p1.then(p2, error)` 返回的是一个 promise 对象，他也是只要改变了状态就不在执行了。
>
>    ​
>
> 4. 这里我们做了一个 try/catch 就是 为了保证当我们的 x.then 报错的时候，能够走到他的 `reject` 方法里面，保证代码不会因为使用人员的错误 而中断。
>
>    ​





* 当 x 不是一个对象，或者函数的时候，直接 把 x resolve 返回


> 当 x 不是一个对象，直接执行 promise2 的 resolve 函数，把 x，传入即可。



经过上面的几个修改规范改造之后，你可以看到如下的 `resolvePromise` 函数：

```
function resolvePromise(promise2, x, resolved, rejected) {
  if(x === promise2){
    return rejected(new TypeError('Chaining cycle detected for promise'));
  }

  let called = false;

  if (x != null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolved, rejected)
        }, err => {
          if(called)return;
          called = true;
          rejected(err);
        })
      } else {
        resolved(x);
      }
    } catch(err) {
      if (called) return;
      called = true;
      rejected(err);
    }
  } else {
    resolved(x);
  }
}
```



* 规范规定，then 相关的代码，需要异步执行，需要放在 setTimeout 或者 setImmediate的宏任务 或者 process.nextTick或者MutationObserver 或者 postmessage 等的微任务中去。这里我们以setTimeout为例


> 这里就是要将我们`then` 中的函数，都包一个 setTimeout，放到一个宏任务中去，关于 `js` 的 `EventLoop`，大家可以去看看相应的文章，其实蛮简单的，js 是单线程的语言，他在执行主函数的时候，会讲相应的宏任务宏任务的消息队列中，微任务添加到微任务的消息队列中去，然后在一个一个去执行相应的消息队列中的函数。下次可以写一篇文章聊聊这个。
>
> 我们可以得到这样的代码：

```
then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err}

    let promise2;

    if (this.status === MyPromise.RESOLVED) {
      promise2 = new MyPromise((resolved, rejected) => {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolved, rejected);
          } catch(err) {
            rejected(err);
          }
        }, 0);
      })
    }

    if (this.status === MyPromise.REJECTED) {
      promise2 = new MyPromise((resolved, rejected) => {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolved, rejected);
          } catch(err) {
            rejected(err);
          }
        }, 0);
      })
    }

    if (this.status === MyPromise.PENDING) {
      promise2 = new MyPromise((resolved, rejected) => {
        
          this.resolvedQueues.push(() => {
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolved, rejected);
              } catch(err) {
                rejected(err);
              }
            }, 0);
          })

          this.rejectedQueues.push(() => {
            setTimeout(() => {
              try {
                let x = onRejected(this.reason);
                resolvePromise(promise2, x, resolved, rejected);
              } catch(err) {
                rejected(err);
              }
            }, 0);
          })

      })
    }

    return promise2;
  }
```

将回调函数，包在setTimeout 中，让他异步执行。



这样写会有一个问题，就是其实 我们知道 promise 是一个微任务，但是我们通过 setTimeout 变成了一个宏任务，这样就会出现一个问题：

```
// MyPromise

setTimeout(() => {
      console.log('---1----');
}, 0);

var p5 = new MyPromise((resolved, rejected) => {
      resolved('---p1---');
})

p5.then(res => {
      console.log('---res---', res)
});

// 正宗的promise
setTimeout(() => {
      console.log('---1----');
}, 0);

var p6 = new MyPromise((resolved, rejected) => {
      resolved('---p1---');
})

p6.then(res => {
      console.log('---res---', res)
});
```

> 上面这个会先输出 1，然后输出`---p1---`
>
> 下面这个会输出 `---p1---`，在输出1
>
> 这里是微任务和宏任务执行顺序的问题，改进方法，我们可以 用微任务（`postmessage`）去包裹，不用setTimeout 去包裹，具体我在这里就不在详述了。






至此到这里我们跑一下测试：

在代码里面加上：

```
// 执行测试用例需要用到的代码
MyPromise.deferred = function() {
  let defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
  });
  return defer;
}
```

需要提前安装一下测试插件：

```
1.npm i -g promises-aplus-tests
2.promises-aplus-tests MyPromise.js
```





### 五，实现 promise 的一些实例和静态方法

实现了主逻辑之后，其实一些静态方法相对来说，就很简单了。

1. `Catch`  方法

   其实这个方法就是 `then` 方法的语法糖：

   ```
   catch(fn){
      return this.then(null,fn);
   }
   ```

   ​

2. `Resolve` 方法

   ```
   //resolve 方法

   MyPromise.resolve = function(val){
     return new Promise((resolve,reject)=>{
       resolve(val)
     });
   }
   ```

   ​

3. `Reject` 方法

   ```
   //reject 方法

   return new Promise((resolve,reject)=>{
       reject(val)
   });
   ```

   ​

4. `race` 方法

   ```
   //race方法 

   MyPromise.race = function(promises){
     return new Promise((resolve,reject)=>{
       for(let i=0; i<promises.length; i++){
         promises[i].then(resolve,reject)
       };
     })
   }
   ```

   ​

5. `all`方法

   ```
   //all方法

   MyPromise.all = function(promises) {
       return new MyPromise(function(resolve, reject) {
           let result = [];
           let count = 0;
           for (let i = 0; i < promises.length; i++) {
               promises[i].then(function(data) {
                   result[i] = data;
                   if (++count == promises.length) {
                       resolve(result);
                   }
               }, function(error) {
                   reject(error);
               });
           }
       });
   }

   // 或者

   MyPromise.all = function(promises){
     let arr = [];
     let i = 0;
     function processData(index,data){
       arr[index] = data;
       i++;
       if(i == promises.length){
         resolve(arr);
       };
     };

     return new Promise((resolve,reject)=>{
       for(let i=0;i<promises.length;i++){
         promises[i].then(data=>{
           processData(i,data);
         },reject);
       };
     });
   }
   ```

   ​

6. `finally` 方法

   ```
   // finally方法

   // 加入一个 this.finallyQueues = []; 函数数组
   // 添加一个实例方法，finally
   // 将 finally 中的函数，push 到 this.finallyQueues
   // 在 resolve 和 reject 方法中循环执行 this.finallyQueues这个数组的方法


   第二个方法：

   finally(fn){
      return this.then(fn, fn);
   }
   ```

   ​





### 六，总结