import { Grammar, Rule } from 'nearley';
import { Buffer } from 'safe-buffer';
Object.assign(window, {Buffer});  // Kremlin discrepancy

import Vue from 'vue';
// @ts-ignore
import whiteboard from './components/whiteboard.vue';
import './main.css';

import { DocumentModel as M, DocumentActions as A } from './model';
import { FileStore, LocalStore, StoreBase } from './store';

import { PickLexer, PassThroughLexer } from './syntax/lexer';
import { SpiralParser } from './syntax/parser';


class App {
    store = new LocalStore('document');
    view: whiteboard;

    constructor(container = 'div#app') {
        this.view = new Vue(whiteboard) as whiteboard;
        this.view.model = this.restore();
        this.view.$mount(container);

        this.view.$on('action', (loc: A.ActionLocator, action: A.Action) => {
            A.applyAction(loc, action);
            this.store.save(this.view.model);
        });    
    }

    restore() {
        var model = this.store.load() || this._mkdoc();
        return model;
    }

    new() {
        this.view.model = this._mkdoc();
    }

    save(filename?: string) {
        var s: StoreBase = filename ? new FileStore(filename, this.store.ser)
                                    : this.store;
        s.save(this.view.model);
    }

    open(filename: string) {
        this.view.model = new FileStore(filename, this.store.ser).load();
    }

    _mkdoc() {
        return new M.Document();
    }
}

function main() {
    var app = new App();

    Object.assign(window, {app});
}


/**
 * This is an experiment in defining a flexible syntax similar to Coq's
 * notation mechanism.
 */
function wip_flexiparse() {
    var lex;
    var lvl1 = {
            lex: lex = new PickLexer({'[': '\\[', ']': '\\]', '{': '{', '}': '}', '(': '\\(', ')': '\\)'}),
            pars: new SpiralParser(Object.assign(new Grammar([
                new Rule('E', []), new Rule('E', ['P', 'E']),
                new Rule('P', ['[]']), new Rule('P', ['{}']), new Rule('P', ['()']),
                new Rule('[]', [{type: '['}, 'E', {type: ']'}]),
                new Rule('{}', [{type: '{'}, 'E', {type: '}'}]),
                new Rule('()', [{type: '('}, 'E', {type: ')'}])
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
    var ast1 = lvl1.pars.parse(["s_0[R^*]s", ", s[R]s', ni=n_0i",  "\\vdash n'u=n_0u, u <_0 i'"]);
    console.log(ast1);
    var ast2 = lvl2.pars.parse(ast1.children.map(x => x.text || {type: x.type, value: <any>x}));
    console.log(ast2);

    Object.assign(window, {lvl1, lvl2});
    //console.log(lvl2.pars.parse(["s_0", "s, s", "s' \\vdash n(i)"]));
    //console.log(pars.parse(['s_0[R^*]s', {type: 'K', value: '0'}, 's[R]s\'']));
}



window.addEventListener('load', main);