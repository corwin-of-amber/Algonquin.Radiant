import { Grammar, Rule } from 'nearley';
import { Buffer } from 'safe-buffer';
Object.assign(window, {Buffer});  // Kremlin discrepancy

import Vue from 'vue';
// @ts-ignore
import whiteboard from './components/whiteboard.vue';
import './main.css';

import { DocumentModel as M, DocumentActions as A } from './model';
import { LocalStore } from './store';

import { PickLexer, PassThroughLexer } from './syntax/lexer';
import { SpiralParser } from './syntax/parser';


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

    var lex;
    var lvl1 = {
            lex: lex = new PickLexer({'[': '\\[', ']': '\\]', '{': '{', '}': '}'}),
            pars: new SpiralParser(Object.assign(new Grammar([
                new Rule('E', []), new Rule('E', ['P', 'E']),
                new Rule('P', ['P1']), new Rule('P', ['P2']),
                new Rule('P1', [{type: '['}, 'E', {type: ']'}]),
                new Rule('P2', [{type: '{'}, 'E', {type: '}'}])
            ]), {Rigid: ['E']}), {lexer: new PassThroughLexer(lex)})
        },
        lvl2 = {
            lex: lex = new PickLexer({',': ',', '|-': '\\\\vdash'}),
            pars: new SpiralParser(Object.assign(new Grammar([
                new Rule('E', ['S1', {type: '|-'}, 'S1']),
                new Rule('S1', ['Q']),
                new Rule('S1', ['Q', {type: ','}, 'S1']),
                new Rule('Q', [])
            ]), {Rigid: ['S1']}), {lexer: new PassThroughLexer(lex)})
        };

    /*
    for (let el of app.model.elements) {
        if (el.tex) { 
            console.log(`%c${el.tex}`, 'color: #c5c');
            console.log(pars.parse([el.tex]));
        }
    }*/
    var ast1 = lvl1.pars.parse(["s_0[R^*]s", ", s[R]s', kw, ni=n_0i",  "\\vdash n(i) <_0 u"]);
    console.log(ast1);
    var ast2 = lvl2.pars.parse(ast1.children.map(x => x.text || {type: x.type, value: <any>x}));
    console.log(ast2);

    Object.assign(window, {lvl1, lvl2});
    //console.log(lvl2.pars.parse(["s_0", "s, s", "s' \\vdash n(i)"]));
    //console.log(pars.parse(['s_0[R^*]s', {type: 'K', value: '0'}, 's[R]s\'']));
}

window.addEventListener('load', main);