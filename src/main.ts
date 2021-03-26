import Vue from 'vue';
// @ts-ignore
import whiteboard from './components/whiteboard.vue';
import './main.css';


function main() {
    var app = new Vue(whiteboard) as whiteboard;
    app.model = {
        elements: [
            {id: '1', at: {x: 25, y: 25}, tex: "c = \\pm\\sqrt{a^2 + b^2}"}
        ]
    };
    app.$mount('div#app');
}

window.addEventListener('load', main);