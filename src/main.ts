import { Buffer } from 'safe-buffer';
Object.assign(window, {Buffer});  // Kremlin discrepancy

import Vue from 'vue';
// @ts-ignore
import whiteboard from './components/whiteboard.vue';
import './main.css';

import { DocumentModel as M, DocumentActions as A } from './model';
import { LocalStore } from './store';

var l = new LocalStore('document');


function main() {
    var model = l.load() || {};
    model.elements ??= [
        {id: '1', at: {x: 25, y: 25}, tex: "c = \\pm\\sqrt{a^2 + b^2}"}
    ];
    model = Object.assign(new M.Document(), model);

    var app = new Vue(whiteboard) as whiteboard;
    app.model = model;
    app.$mount('div#app');

    app.$on('action', (loc: A.ActionLocator, action: A.Action) => {
        A.applyAction(loc, action);
        l.save(app.model);
    });

    Object.assign(window, {app, l});
}

window.addEventListener('load', main);