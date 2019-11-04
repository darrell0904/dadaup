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



刚刚我们完成的 promise 中 有几个 需要根据规范修改一下：

* 当 x 和 promise2 是相同的对象，那么`promise`则以拒绝`TypeError`为理由。 （2.3.1）
* 当 x 是一个 promise ，那么就 等待 x 改变状态之后，才算 完成或者失败（这个也属于第三条，因为promise 其实也是一个 thenable 对象）
* 当 x 是一个对象 或者 函数的时候，就是 （thenable对象），那就那 x.then 作为 then，
* 当 x 不是一个对象，或者函数的时候，直接 把 x resolve 返回
* 规范规定，then 相关的代码，需要异步执行，需要放在 setTimeout 或者 setImmediate的宏任务 或者 process.nextTick或者MutationObserver 或者 postmessage 等的微任务中去。这里我们以setTimeout为例





到这里我们跑一下测试：

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





### 五，实现 promise 的一些静态方法





### 六，总结