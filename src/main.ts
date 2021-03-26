import { Buffer } from 'safe-buffer';
Object.assign(window, {Buffer});  // Kremlin discrepancy

import Vue from 'vue';
// @ts-ignore
import whiteboard from './components/whiteboard.vue';
import './main.css';

import { DocumentActions as A } from './model';
import { LocalStore } from './store';

var l = new LocalStore('document');


function main() {
    var app = new Vue(whiteboard) as whiteboard;
    app.model = l.load() || {
        elements: [
            {id: '1', at: {x: 25, y: 25}, tex: "c = \\pm\\sqrt{a^2 + b^2}"}
        ]
    };
    app.$mount('div#app');

    app.$on('action', (loc: A.ActionLocator, action: A.Action) => {
        A.applyAction(loc, action);
        l.save(app.model);
    });

    Object.assign(window, {app});
}

window.addEventListener('load', main);