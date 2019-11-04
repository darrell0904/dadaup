class MyPromise {
  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = null;
    this.reason = null;

    this.resolvedQueues = [];
    this.rejectedQueues = [];

    let resolved = (val) => {
      if (this.status == MyPromise.PENDING) {
        this.value = val;
        this.status = MyPromise.RESOLVED;
        this.resolvedQueues.forEach(cb => cb(this.value))
      }
    }

    let rejected = (reason) => {
      if (this.status == MyPromise.PENDING) {
        this.reason = reason;
        this.status = MyPromise.REJECTED;
        this.rejectedQueues.forEach(cb => cb(this.reason))
      }
    }

    try{
      executor(resolved, rejected);
    } catch (err) {
      reject(err);
    }
  }

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
      return promise2 = new MyPromise((resolved, rejected) => {
        setTimeout(() => {
          this.resolvedQueues.push(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolved, rejected);
            } catch(err) {
              rejected(err);
            }
          })
        }, 0);

        setTimeout(() => {
          this.rejectedQueues.push(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolved, rejected);
            } catch(err) {
              rejected(err);
            }
          })
        }, 0);
      })
    }
  }
}

MyPromise.PENDING = 'pending';
MyPromise.RESOLVED = 'resolved';
MyPromise.REJECTED = 'rejected';

function resolvePromise(promise2, x, resolved, rejected) {
  if (promise2 === x) {
    rejected('循环引用')
  }

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
  } else if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      then = x.then;

      if (typeof then === 'function') {
        then.call(x, y => {
          resolvePromise(promise2, y, resolved, rejected)
        }, err => {
          rejected(err);
        })
      } else {
        resolved(x);
      }

    } catch(err) {
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
