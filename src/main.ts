import { Grammar, Rule } from 'nearley';

import Vue from 'vue';

import { DocumentModel as M, DocumentActions as A } from './model';
import { FileStore, LocalStore, StoreBase } from './store';

import whiteboard, { IWhiteboardApp } from './components/whiteboard.vue';
import { Attach, Compute } from './elements/dependencies';
import './main.css';
import './elements.scss';


class App {
    store = new LocalStore('document')
    view: IWhiteboardApp
    attach: Attach
    compute: Compute

    constructor(container = 'body') {
        this.view = Vue.createApp(whiteboard, {
                onAction: (loc: A.ActionLocator, action: A.Action) => this._viewAction(loc, action)
            }).mount(container) as IWhiteboardApp;
        this.attach = new Attach(this.view).withQualifiedPath(['attach']);
        this.compute = new Compute(this.view).withQualifiedPath(['compute']);
        this.doc = this.restore();
        this._dataflow();
    }

    restore() {
        return M.Document.promote(this.store.load() ?? this._mkdoc());
    }

    new() {
        this.doc = this._mkdoc();
    }

    save(filename?: string) {
        var s: StoreBase = filename ? new FileStore(filename, this.store.ser)
                                    : this.store;
        s.save(this.view.model);
    }

    open(filename: string) {
        this.doc = new FileStore(filename, this.store.ser).load();
    }

    get doc(): M.Document { return this.view.model; }
    set doc(d: M.Document) {
        this.view.model = d;
        this._docPersist?.cancel();
        /* @note: model may contain some reactive sub-parts.
         * It is imperative to persist the reactive (proxied) version thereof. */
        this._docPersist = this.store.persist(this.doc);
    }

    _docPersist: {cancel: () => void}

    _mkdoc() {
        return new M.Document();
    }

    _viewAction(loc: A.ActionLocator, action: A.Action) {
        A.applyAction(loc, action);
        this.store.save(this.view.model);
    }

    _dataflow() {
        for (let [category, ...spec] of this.doc.dataflow) {
            switch (category) {
                case 'attach': this.attach.apply(spec); break;
                case 'compute': this.compute.apply(spec); break;
                default:
                    console.warn(`invalid dataflow category '${category}'`);
            }
        }
    }
}

function main() {
    var app = new App();

    Object.assign(window, { app, Vue });
}


/*
 * This is an experiment in defining a flexible syntax similar to Coq's
 * notation mechanism.
 */

import { PickLexer, PassThroughLexer } from './syntax/lexer';
import { SpiralParser } from './syntax/parser';

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