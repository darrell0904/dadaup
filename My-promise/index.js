class MyPromise {
  static PENDING = 'pending';
  static RESOLVED = 'resolved';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;

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

  catch(fn){
    return this.then(null,fn);
  }
}

MyPromise.PENDING = 'pending';
MyPromise.RESOLVED = 'resolved';
MyPromise.REJECTED = 'rejected';

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

// 执行测试用例需要用到的代码
MyPromise.deferred = function() {
  let defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
  });
  return defer;
}

try {
  module.exports = MyPromise
} catch (e) {}
