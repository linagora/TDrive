import React, { Component } from 'react';

import './interactive-login-background.scss';

export default class InteractiveLoginBackground extends React.Component {
  constructor(props) {
    super();

    this.lFollowX = 0;
    this.lFollowY = 0;
    this.x = 0;
    this.y = 0;
    this.friction = 1 / 30;

    this.objects = [];
  }
  addObject() {
    var div = document.createElement('div');

    var size = Math.pow(0.1 + Math.random(), 2) * 10;
    var left = Math.random() * 100 + 'vw';

    div.style.width = size + 'px';
    div.style.height = size + 'px';

    var duration = 30 + Math.random() * 15;
    var time_class = 'a';
    if (duration > 40) {
      time_class = 'b';
    } else if (duration >= 35) {
      time_class = 'c';
    }

    div.style.animationDelay = '-' + Math.random() * 45 + 's';
    div.style.animationDuration = duration + 's';

    div.style.left = left;

    div.classList.add('animated_shape');
    if (Math.random() > 0.5) {
      div.classList.add('circle');
    }
    div.classList.add('speed-' + time_class);

    this.background.appendChild(div);

    this.objects.push(div);
  }
  mousemove(evt) {
    this.lFollowX = evt.clientX / window.innerWidth;
    this.lFollowY = evt.clientY / window.innerHeight;
  }
  moveBackground() {
    if (!this.mounted) {
      return;
    }

    this.x += (this.lFollowX - this.x) * this.friction;
    this.y += (this.lFollowY - this.y) * this.friction;

    this.objects.forEach(div => {
      var fa, fb;
      if (div.classList.contains('speed-a')) {
        fa = 50;
        fb = 15;
      }
      if (div.classList.contains('speed-b')) {
        fa = 40;
        fb = 10;
      }
      if (div.classList.contains('speed-c')) {
        fa = 30;
        fb = 5;
      }
      div.style.marginLeft = (this.x - 0.5) * fa;
      div.style.marginTop = (this.y - 0.5) * fb;
    });

    window.requestAnimationFrame(this.moveBackground);
  }
  componentDidMount() {
    for (var i = 0; i < 50; i++) {
      this.addObject();
    }

    this.mousemove = this.mousemove.bind(this);
    this.moveBackground = this.moveBackground.bind(this);

    this.mounted = true;
    this.moveBackground();
    document.addEventListener('mousemove', this.mousemove);
  }
  componentWillUnmount() {
    this.mounted = false;
    document.removeEventListener('mousemove', this.mousemove);
  }
  render() {
    return <div ref={node => (this.background = node)} className="animated_background" />;
  }
}
