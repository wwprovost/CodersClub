export class Clock {

  constructor(interval) {
    this.notifyAll = this.notifyAll.bind(this);

    this.interval = interval;
    this.subscribers = [];
    this.views = [];

    this.start();
  }

  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber) {
    for (let i = 0; i < this.subscribers.length; ++i) {
      if (this.subscribers[i] == subscriber) {
        this.subscribers.splice(i, 1);
        return;
      }
    }
  }

  subscribeView(view) {
    this.views.push(view);
  }

  unsubscribeView(view) {
    for (let i = 0; i < this.views.length; ++i) {
      if (this.subscribers[i] == view) {
        this.views.splice(i, 1);
        return;
      }
    }
  }

  notifyAll() {
    this.subscribers.forEach(subscriber => subscriber.tick());
    this.views.forEach(view => view.tick());
  }

  start() {
    this.timer = setInterval(this.notifyAll, this.interval);
  }

  stop() {
    clearInterval(this.timer);
  }
}
