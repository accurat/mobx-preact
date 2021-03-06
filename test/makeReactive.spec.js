import 'mocha';
import { observable, extendObservable, toJS } from 'mobx';
import { expect } from 'chai';
import { h, render, Component } from 'preact';
import makeReactive from '../src/makeReactive';

let todoListRenderings = 0;
let todoListWillReactCount = 0;
const store = {
	todos: observable(['one', 'two']),
	extra: observable({ test: 'observable!' })
};

describe('MobX Observer', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
		render(null, container);
	});

	const TodoItem = makeReactive(function({ todo }) {
		return <li>{ todo }</li>;
	});

	const TodoList = makeReactive(class extends Component {
		componentWillReact() {
			todoListWillReactCount++;
		}

		render() {
			todoListRenderings++;
			const todos = store.todos;
			return <div>{todos.map(todo => <TodoItem todo={todo}/>)}</div>;
		}
	});

	it('should render a component', () => {
		expect(() => render(<TodoList/>, container)).to.not.throw(Error);
	});

	it('should render a todo list', () => {
		render(<TodoList/>, container);
		expect(container.innerHTML).to.equal('<div><li>one</li><li>two</li></div>');
	});

	it('should render a todo list with added todo item', () => {
		store.todos.push('three');
		render(<TodoList/>, container);
		expect(container.innerHTML).to.equal('<div><li>one</li><li>two</li><li>three</li></div>');
	});

	it('should render a todo list with non observale item', () => {
		const FlatList = makeReactive(class extends Component {
			render({ extra }) {
				return <div>{store.todos.map(title => <li>{ title }{ extra.test }</li>)}</div>;
			}
		});

		render(<FlatList extra={ store.extra }/>, container);
		store.extra = toJS({ test: 'XXX' });
		render(<FlatList extra={ store.extra }/>, container);
		extendObservable(store, {
			test: 'new entry'
		});
		render(<FlatList extra={ store.extra }/>, container);
		expect(container.innerHTML).to.equal('<div><li>oneXXX</li><li>twoXXX</li><li>threeXXX</li></div>');
	});

});
