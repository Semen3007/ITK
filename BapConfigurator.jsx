import React from 'react';
import Configurator from './Configurator.jsx';
import Button from './ui/button/Button.jsx';
import styles from './BapConfigurator.styl';
import Table from './ui/features/Table.jsx';
import TextInput from './ui/TextInput.jsx';
import jQuery from 'jquery'

/**
 * Конфигуратор Подбора БАП
 */


class BapConfigurator extends Configurator
{
	constructor(props) {
		super(props);
		this.db = null;
		this.filter = {};

		this.state = {
			filter:{
				type: [],
				connectionType:[],
				lampSearch:'',
				power: '',
			},
			items: [],
			bap: [],
			basket:[],
			itemInfo: null,
			itemBap:[],
			BapListHover:false
		};
		this.onFilter = this.onFilter.bind(this)
		this.addInfo = this.addInfo.bind(this)
		this.addBasket = this.addBasket.bind(this)
		this.onDelete = this.onDelete.bind(this)
		this.onReset = this.onReset.bind(this)
		this.onChangeQuantity = this.onChangeQuantity.bind(this)
		this.doPrint = this.doPrint.bind(this)
		this.onBtnPrintExcelClick = this.onBtnPrintExcelClick.bind(this)
		this.onMouseEnter = this.onMouseEnter.bind(this)
		this.onMouseLeave = this.onMouseLeave.bind(this)
	}

	onAfterDbLoad () {
		this.setState({bap: this.db.list.bap_power, items: this.db.list.bap_lamp})
	}

	getType() {
		return 'bap';
	}

	getCustomElements() {
		let elements = [];

		elements.push(
			<Button
				x="30"
				y="780"
				buttonStyle={styles.mainBtn}
				buttonDisabledStyle={styles.mainBtnDisabled}
				textStyle={styles.mainBtnText}
				iconStyle={styles.pdfBtnIcon}
				text="В корзину"
				disabled={!this.state.basket.length}
				onClick={() => this.doAddToCart(this.state.basket)}
				key="addtocart"
			/>
		);

		elements.push(
			<Button
				x="220"
				y="780"
				buttonStyle={styles.mainBtn}
				buttonDisabledStyle={styles.mainBtnDisabled}
				textStyle={styles.mainBtnText}
				iconStyle={styles.pdfBtnIcon}
				text="Сохранить в PDF"
				disabled={!this.state.basket.length}
				onClick={this.onBtnPrintPdfClick}
				key="printpdf"
			/>
		);

		elements.push(
			<Button
				x="412"
				y="780"
				buttonStyle={styles.stepBtn}
				buttonDisabledStyle={styles.mainBtnDisabled}
				textStyle={styles.mainBtnText}
				iconStyle={styles.stepBtnIcon}
				text="Сохранить в EXCEL"
				disabled={!this.state.basket.length}
				onClick={this.onBtnPrintExcelClick}
				key="printExcel"
			/>
		);

		elements.push(
			<Button
				x="609"
				y="780"

				buttonStyle={styles.mainBtn}
				buttonDisabledStyle={styles.mainBtnDisabled}
				textStyle={styles.mainBtnText}
				iconStyle={styles.printBtnIcon}
				text="Распечатать"
				disabled={!this.state.basket.length}
				onClick={this.doPrint}
				key="print"
			/>
		);

		elements.push(
			<a
				target="_blank"
				style={{
					width: '183px',
					height: '35px',
					left: '806px',
					top: '780px',
					position: 'absolute',
					textDecoration: 'none',
					color: '#334647'}}
				href={'https://www.iek.ru/products/where_to_buy/'}
			>
				<Button
					x="0"
					y="0"
					buttonStyle={styles.mainBtn}
					buttonDisabledStyle={styles.mainBtnDisabled}
					textStyle={styles.mainBtnText}
					iconStyle={styles.dwgBtnIcon}
					text='Где купить?'
					key="getBuy" />
			</a>
		);

		return elements;
	}

	onBtnPrintExcelClick() {
		this.doPrint({format: 'xls'});
	}

	doPrint(params) {
		let _params = params || {};
		_params.data = {
			speclist: JSON.stringify(this.state.basket)
		};

		super.doPrint(_params);
	}

	getCustomStyles() {
		return styles;
	}

	// добавить элемент в информацию о товаре
	addInfo (item)   {
		jQuery.getJSON(
			'itkcfg.php',
			{
				type: 'bap',
				action: 'getItem',
				article: item.article
			},
			items => {

				let itemBapList = this.state.bap.filter(i => {
					return item.type_id.split(',').includes(i.type_id)
				})
				let itemBap = itemBapList.map(i =>{
					return {
						...i,
					limit: i.power/item.power < 1
					}
				})
				this.setState((prevState) => {
					return {
						itemInfo: {
						...item,
						photo:(items[0] && items[0].ImgJpeg[0] && items[0].ImgJpeg[0].file_ref.uri) || '',
						description:items[0] && items[0].Description[0] && items[0].Description[0].desc_ru || '',
					},
						itemBap: item.bap ? itemBap : [...prevState.itemBap]
				}})
			}
		);
	}
	// добавить элемент в корзину
	addBasket(item) {
		this.setState(prevState => {
			const basket = [...prevState.basket]
			if (basket.some(i => i.article === item.article)) {
				basket.map(i => {
					if(i.article === item.article) {
						i.count += 1
					}
					return i
				})
			// } else if (item.article === 'LLVPOD-EPK-12-3H') { // Совместные товары, нужно добавлять парно, костыль, чтоб не ломать логику
			// 	// const addItem = this.state.bap.filter(i => i.article === 'LDVAOD-SMD-2835-18')[0]
			// 	// addItem.quantity = 1
			// 	item.quantity = 1
			// 	basket.push(item)
			// 	// basket.push(addItem)
			// 	return {basket}
			// } else if (item.article === 'LDVAOD-SMD-2835-18') {
			// 	const addItem = this.state.bap.filter(i => i.article === 'LLVPOD-EPK-12-3H')[0]
			// 	addItem.quantity = 1
			// 	item.quantity = 1
			// 	basket.push(item)
			// 	basket.push(addItem)
			// 	return {basket}
			} else {
				item.count = 1
				basket.push(item)
			}
			return {basket}
		})
	}

	// удалить элемент из корзины
	onDelete(item) {
		this.setState({basket: this.state.basket.filter(i => i.article !== item.article)})
	}

	// сборос параметров фильтра
	onReset() {
		this.setState({
			filter: {
				type: [],
				connectionType: [],
				lampSearch: '',
				power: 'Все',
			},
			itemBap: [],
			itemInfo: null
		}, () => {
			this.onFilter(this.state.filter)
		})

	}

	// изменение количества позиции
	onChangeQuantity(item, value) {

		this.setState(prevState => {
			const newBasket = prevState.basket.map(i => {

				if (i.article === item.article) {
					i.count = value
				}
				return i
			})
			return {
				basket: newBasket
			}
		})
	}
	// фильтрация массива данных
	onFilter(filter) {
		let items = [...this.db.list.bap_lamp]
		let bap = [...this.db.list.bap_power]

		if (filter.type.length !== 0) {
			items = items.filter(item => filter.type.some(i => i === item.type))
		}
		if (filter.connectionType.length !== 0) {
			bap = bap.filter(i => filter.connectionType.includes(i.article))
			items = items.filter(item => filter.connectionType.every(i => item.bap.includes(i)))
		}
		if (filter.lampSearch.length !== 0) {
			items = items.filter(item =>
				item.name.toLowerCase().includes(filter.lampSearch.toLowerCase())
				|| item.article.toLowerCase().includes(filter.lampSearch.toLowerCase()))
		}
		if(filter.power !== 'Все') {
			items = items.filter(item => item.power === filter.power)
		}

		const newBapArticle = []

		items.map(item => item.bap.map(i => !newBapArticle.includes(i) ? newBapArticle.push(i) : null))

		const newBap = bap.filter(i => newBapArticle.includes(i.article))
		this.setState({items, bap: newBap})
	}

	onMouseEnter(){this.setState({ BapListHover: true })}
	onMouseLeave(){this.setState({ BapListHover: false })}

	render() {
		if (!this.db) {
			return <div className={styles.cfg} />;
		}
		return (

			<div className={styles.cfg}>

				<span className={styles.title}>Конфигуратор подбора БАП</span>

				{/*кноки*/}
				{this.getCustomElements ? this.getCustomElements() : null}

				{/*// Фильтр*/}
				<Filter state={this.state} db={this.db} onFilter={this.onFilter} onReset={this.onReset}/>

				{/*Список светильников */}
				<Table
					title='Выбор светильников'
					type='lampsList'
					styles={{width: '470px', top: '280px', left: '30px', height: '250px', fontSize: '10px'}}
					items={this.state.items}
					onSelect={this.addInfo}
					addBasket={this.addBasket}
					itemInfo={this.state.itemInfo}
				/>

				{/*Список БАП */}
				<Table
					title='БАП соответствующий выбранному светильнику'
					type='BapList'
					styles={{width: '450px', top: '126px', left: '539px', height: '169px', fontSize: '10px'}}
					items={this.state.itemBap.length ? this.state.itemBap : this.state.bap}
					onSelect={this.addInfo}
					addBasket={this.addBasket}
					itemInfo={this.state.itemInfo}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
					BapListHover={this.state.BapListHover}
				/>

				{/* Список спецификации */}
				<Table
					title='Корзина'
					type='Bucket'
					styles={{width: '470px', top: '569px', left: '30px', height: '169px', fontSize: ' 10px'}}
					items={this.state.basket}
					onSelect={this.addInfo}
					onDelete={this.onDelete}
					onChangeQuantity={this.onChangeQuantity}
				/>

				{/* Артикул и название */}
				{this.state.itemInfo ? (
					<a href={`https://www.iek.ru/products/catalog/?page=detail&article=${this.state.itemInfo.article}`}
						 target="_blank">
						<div className={styles.name}>
							<div><strong>{this.state.itemInfo.name}</strong></div>
							<div><strong>{this.state.itemInfo.article}</strong></div>
						</div>
					</a>
				) : (
					<div className={styles.nameEmpty}/>
				)}

				{/* Изображение */}
				<div
					className={styles.img}
					style={this.state.itemInfo && this.state.itemInfo.photo ?
						{backgroundImage: `url(${this.state.itemInfo.photo})`, backgroundSize: 'contain'}
						: null
					}
				/>

				{/* Описание */}
				{this.state.itemInfo && this.state.itemInfo.description ? (
					<div className={styles.description}>{this.state.itemInfo.description}</div>
				) : (
					<div className={styles.descriptionEmpty}/>
				)}

				{/* Техническая поддержка */}
				<span className={styles.techSupport}>{this.db.localization.techSupport[this.props.locale]}</span>
				<a href={this.db.localization.homeLink[this.props.locale]} className={styles.homeLink}>На основной сайт IEK</a>
			</div>

		);
	}
}

export default BapConfigurator;

class Filter extends React.Component
{
	constructor(props) {
		super(props);
		this.state = {
			lampSearch: '',
			filter: {
				lampSearch: '', // поиск по названию
				type:[], // выбранные значения фильтра
				connectionType: [], // выбранные значения фильтра
				power: 'Все' // фильтр по мощности
			},
			select: {
				type: 'Все',
				connectionType:'Все',
			}, // показ выбранного параметра
			type: [
				[
					'Панели светодиодные',
					[
						'Светодиодные панели',
						'Светодиодные панели ультратонкие',
						'Светодиодные панели специального назначения'
					]
				],
				[
					'Светильники для торгового освещения',
					[
						'Даунлайты классические',
						'Даунлайты ультратонкие',
						'Светильники трековые',
						'Светильники линейные для ритейла'
					],
				],
				[
					'Промышленное освещение',
					[
						'Светильники пылевлагозащищенные ДСП',
						'Светильники для высоких пролетов'
					]
				],
				[
					'Уличное и архитектурное освещение',
					[
						'Прожекторы светодиодные СДО',
						'Светильники светодиодные консольные ДКУ'
					]
				]
			], // параметры к назначеню светильника
			connectionType:[
				[
					'1 светильник (с сохранением заявленных параметров)',
					[
						'LLVPOD-EPK-12-3H',
						'LLVPOD-EPK-40-1H',
						'LLVPOD-EPK-40-3H',
						'LLVPOD-EPK-120-1H-3H',
						'LLVPOD-EPK-200-1H',
						'LLVPOD-EPK-200-3H'
					]
				],
				[
				'более 1 со снижением светового выхода в аварийном режиме',
					[
						'LLVPOD-EPK-40-1H',
						'LLVPOD-EPK-40-3H',
						'LLVPOD-EPK-120-1H-3H',
						'LLVPOD-EPK-200-1H',
						'LLVPOD-EPK-200-3H'
					]
				],
				[
				'более 1 с сохранением 100% светового выхода в аварийном режиме',
					[
						'LLVPOD-EPK-40-1H-U',
						'LLVPOD-EPK-120-1H-U',
						'LLVPOD-EPK-200-1H-U'
					]
				]
			] // параметры к тип подключения на 1 БАП
		}

		this.renderType = this.renderType.bind(this)
		this.onReset = this.onReset.bind(this)
		this.renderConnectionType = this.renderConnectionType.bind(this)
		this.switchFilter = this.switchFilter.bind(this)
		this.lampSearchHandle = this.lampSearchHandle.bind(this)
	}

	switchFilter(value, type) {
		const state = this.state
		const filter = this.state.filter
		filter[type] = []

		switch (value) {
			case 'Все':
				break
			case 'Коммерческое освещение':
				filter.type.push(...state.type[0][1])
				filter.type.push(...state.type[1][1])
				break
			case 'Панели светодиодные':
				filter.type.push(...state.type[0][1])
				break
			case 'Светильники для торгового освещения':
				filter.type.push(...state.type[1][1])
				break
			case 'Промышленное освещение':
				filter.type.push(...state.type[2][1])
				break
			case 'Уличное и архитектурное освещение':
				filter.type.push(...state.type[3][1])
				break
			case '1 светильник (с сохранением заявленных параметров)':
				filter.connectionType.push(...state.connectionType[0][1])
				break
			case 'более 1 со снижением светового выхода в аварийном режиме':
				filter.connectionType.push(...state.connectionType[1][1])
				break
			case 'более 1 с сохранением 100% светового выхода в аварийном режиме':
				filter.connectionType.push(...state.connectionType[2][1])
				break
			default:
				filter.type.push(value)
				break
		}

		this.setState(prevState => {
			return {select:{...prevState.select, [type]: value}, filter}
		})

		this.props.onFilter(filter)
	}

	lampSearchHandle (e) {
		this.setState(prevState => {
			return {
				filter: {...prevState.filter, lampSearch: e }
			}
		}, () => this.props.onFilter(this.state.filter))
	}

	powerHandle (e) {
		this.setState(prevState => {
			return {
				filter: {...prevState.filter, power: e }
			}
		}, () => this.props.onFilter(this.state.filter))
	}

	powerType () {
		const collection = []
		this.props.db.list.bap_lamp.forEach(item => {
			if(item.power && !collection.includes(+item.power)) {
				collection.push(+item.power)
			}
		})
		collection.sort((a, b) => a - b)

		return (
			<select
				className={styles.powerSelect}
				onChange={e => this.powerHandle(e.target.value)}
				value={this.state.filter.power}>
				<option value='Все'>Все</option>
				{collection.map(item => <option key={item} value={item}>{item}</option>)}}
			</select>
		)
	}

	renderType(settings) {
		return (
			<li className={styles.Li}>

				<span onClick={() => this.switchFilter(settings[0],'type')} className={styles.Span}>{settings[0]}</span>

				<ul className={styles.Ul}>

					{settings[1].map((item,i) => <li key={i} className={styles.Li}>
						<span onClick={() => this.switchFilter(item, 'type')} className={styles.Span}>{item}</span>
					</li>)}

				</ul>
			</li>
		)
	}

	renderConnectionType() {
		return (
			<select
				className={styles.Select}
				onChange={e => this.switchFilter(e.target.value,'connectionType')}
				value={this.state.select.connectionType}>
				<option value={'Все'}>Все</option>
				{this.state.connectionType.map((item,i) => <option key={i} value={item[0]}>{item[0]}</option>)}
			</select>
		)
	}

	onReset() {
		this.setState({
			lampSearch: '',
			filter: {
				lampSearch: '',
				type:[],
				connectionType: [],
				power: 'Все'
			},
			select: {
				type: 'Все',
				connectionType:'Все',
			}
		}, () => {
			this.switchFilter('Все', 'type')
			this.switchFilter('Все', 'connectionType')
			this.props.onReset()
		})

	}

	render() {
		return (
			<div className={styles.FilterBlock}>

				{/*назначение светильника*/}
				<div className={styles.selectType}>
					<span className={styles.selectTypeTitle}>Назначение светильника:</span>
					<ul className={styles.selectTypeUl}>

						<li className={styles.selectTypeLi}><span className={styles.Span}>{this.state.select.type}</span>

							<ul className={styles.Ul}>

								<li className={styles.Li}>
									<span className={styles.Span} onClick={() =>this.switchFilter('Все', 'type')}>Все</span>
								</li>

								<li className={styles.Li}>
									<span
										className={styles.Span}
										onClick={() =>this.switchFilter('Коммерческое освещение', 'type')}>
										Коммерческое освещение
									</span>

									<ul className={styles.Ul}>
										{this.renderType(this.state.type[0])}
										{this.renderType(this.state.type[1])}
									</ul>

								</li>

								{this.renderType(this.state.type[2])}
								{this.renderType(this.state.type[3])}

							</ul>
						</li>
					</ul>
				</div>

				{/*тип подключения*/}
				<div className={styles.SelectConnectionType}>
					<span className={styles.selectConnectionTypeTitle}>Тип подключения на 1 БАП:</span>
					{this.renderConnectionType()}
				</div>

				{/*поиск светильника*/}
				<span className={styles.lampSearchTitle}>Поиск светильника:</span>
				<TextInput
					x={10} y={85} width={200}
					value={this.state.filter.lampSearch}
					onChange={this.lampSearchHandle}
				/>

				{/*мощность*/}
				<div className={styles.powerType}>
					<span className={styles.powerTypeTitle}>Мощность Вт:</span>
					{this.powerType()}
				</div>

				{/*кнопка сброса параметров*/}
				<button className={styles.ResetButton} onClick={this.onReset}>Сбросить фильтр</button>

			</div>
		);
	}
}
