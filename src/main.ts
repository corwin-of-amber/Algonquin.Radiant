import { Grammar, Rule } from 'nearley';
import { Buffer } from 'safe-buffer';
import { reactive, ref, Ref } from 'vue';
Object.assign(window, {Buffer});  // Kremlin discrepancy

import Vue from 'vue';
// @ts-ignore
import whiteboard from './components/whiteboard.vue';
import './main.css';

import { DocumentModel as M, DocumentActions as A } from './model';
import { FileStore, LocalStore, StoreBase } from './store';

import { PickLexer, PassThroughLexer } from './syntax/lexer';
import { SpiralParser } from './syntax/parser';
import { CATALOG, CatalogEntry } from './elements';
import { CATALOG as WCATALOG } from './widgets';
import { Point2D } from './geom';


class App {
    store = new LocalStore('document');
    view: whiteboard;

    constructor(container = 'body') {
        this.view = Vue.createApp(whiteboard, {
                onAction: (loc: A.ActionLocator, action: A.Action) => this._viewAction(loc, action)
            }).mount(container) as whiteboard;
        this.doc = this.restore();
    }

    restore() {
        var model = this.store.load() || this._mkdoc();
        return M.Document.promote(model);
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
    set doc(d: M.Document) { this.view.model = d; }

    _mkdoc() {
        return new M.Document();
    }

    _viewAction(loc: A.ActionLocator, action: A.Action) {
        A.applyAction(loc, action);
        this.store.save(this.view.model);
    }
}

function main() {
    var app = new App();

    Object.assign(window, {app, create, CATALOG, WCATALOG, Vue});
}

function newElementFromCatalog(doc: M.Document, cat: CatalogEntry, pos: Point2D) {
    return {
        id: doc.mkId(),
        type: cat.type,
        at: pos,
        ...cat.stencil
    } as M.Element;
}

function newWidgetFromCatalog(doc: M.Document, elem: M.Element, cat: CatalogEntry, pos: Point2D) {
    return {
        id: doc.mkId(),
        type: cat.type,
        at: pos,
        for: elem,
        ...cat.stencil
    }
}

function create(app: App, cat: CatalogEntry, forElem?: M.Element) {
    const at = {x: 50, y: 50},
          newElem = forElem ? newWidgetFromCatalog(app.doc, forElem, cat, at)
                            : newElementFromCatalog(app.doc, cat, at);
    app._viewAction({doc: app.doc, elem: null},
        {type: 'create', newElem} as A.CreateAction)
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