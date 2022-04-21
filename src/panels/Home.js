import React from "react";
import bridge from "@vkontakte/vk-bridge";
import queryString from "query-string";
import { platform } from "@vkontakte/vkui";
import { FaLink, FaHistory, FaStar, FaInfoCircle } from "react-icons/fa";
import {
	PanelHeader,
	Panel,
	Tabbar,
	TabbarItem,
	Epic,
	Div,
	Button,
	CardGrid,
	SimpleCell,
	ContentCard,
	PanelHeaderButton,
	Header,
	ScreenSpinner,
	FormLayout,
	FormItem,
	Input,
	Select,
	PullToRefresh,
	Avatar,
	Group,
	RichCell,
} from "@vkontakte/vkui";
import {
	Icon28LikeOutline,
	Icon28LikeCircleFillRed,
	Icon28ChevronRightOutline,
} from "@vkontakte/icons";

import img1 from "../img/1.webp";
import img2 from "../img/2.webp";

import fetch2 from "../components/Fetch";

let messages = [
	"Твоя лучшая ссылка! Ну почти",
	"Какая красивая ссылочка. Ах!",
	"Круто, может еще чего сократим?",
	"Чего так мало ссылочек то? Сократи еще чего!",
	"Я надеюсь эта ссылка не ведёт на канал А4?",
	"Ссылка Б/У, давай по новой!",
	"Не советую её открывать, там троян",
	"Эта ссылка ведёт на канал А4, если что",
	"Ты не слушаешь Клаву Коку? ЧС короче!",
	"Го еще сократим пару ссылочек?",
	"Срочно поделись этой прекрасной ссылкой!",
	"Не позорься, удали эту ссылку",
	"Тебе вообще не стыдно сокращать такое?",
	"Зачем нам большие ссылки? Давай их сократим!",
	"А ссылочка точно безопасна?",
	"Эту ссылку проще запомнить",
	"Определяются не только тексты ссылок, но и окружающий ссылку текст",
	"А эта ссылка действительно будет бесподобна",
	"Эта ссылка - отстой!",
];

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			spinner: true,
			activeStory: "links",
			data: null,
			service: "ok.me",
			formDisabled: false,
			points: 0,
			isFavorite: false,
			shortened: "",
			fetching: false,
			links: [],
			raiting: [],
			btn: "Обновить топ",
			blacklisted: [],
			url: "",
			formstatus: {
				bottom: "",
				status: "default",
				url: "",
				protocol: "",
			},
		};
		this.openPage = this.openPage.bind(this);
		this.validate = this.validate.bind(this);
		this.onRefresh = this.onRefresh.bind(this);
		this.addToFavorites = this.addToFavorites.bind(this);
	}

	componentDidMount() {
		fetch2("initApp").then((data) => {
			this.setState({
				data: data.result,
				points: data.result.points,
				isFavorite: queryString.parse(location.search).vk_is_favorite,
				blacklisted: data.result.blacklisted,
			});
			if (data.result.links !== null) {
				if (data.result.links.length > 0) {
					let links = [];
					data.result.links.map((el) => {
						links.push(
							<ContentCard
								className="content"
								subtitle={
									messages[
										Math.floor(
											Math.random() *
												(messages.length - 0)
										) + 0
									]
								}
								header={el.shortened}
								key={el.id}
								disabled={this.props.disabled}
								onClick={() => {
									this.props.setActiveModal("link", {
										shortened: el.shortened,
										link: el.link
											.replace(/~TAG~/gi, "#")
											.replace(/[%]/gi, "&"),
									});
								}}
								caption={
									"Оригинал: " +
									el.link
										.replace(/~TAG~/gi, "#")
										.replace(/[%]/gi, "&")
								}
							/>
						);
					});
					this.setState({ links: links });
				}
			}
			if (data.result.raiting !== null) {
				if (data.result.raiting.length > 0) {
					let raiting = [];
					let number = 1;
					data.result.raiting.map((el) => {
						raiting.push(
							<a
								key={el.id}
								target="_blank"
								onClick={() => {
									this.props.clickOnLink;
								}}
								href={"https://vk.com/id" + el.user_id}
							>
								<RichCell
									before={
										<Avatar size={48} src={el.photo_200} />
									}
									caption={"Сокращено ссылочек: " + el.points}
									after={"#" + number + " Место"}
								>
									{el.name}
								</RichCell>
							</a>
						);
						number = number + 1;
					});
					this.setState({ raiting: raiting, spinner: false });
				}
			}
		});
	}

	componentWillUnmount() {
		this.setState({
			formstatus: { bottom: "", status: "default", url: "" },
		});
	}

	addToFavorites() {
		if (this.state.isFavorite == 0) {
			bridge.send("VKWebAppAddToFavorites").then((data) => {
				if (data.result === true) {
					this.props.setSnackbar(
						"Сервис добавлен в избранное! Спасибо ❤️",
						2000,
						true
					);
					this.setState({ isFavorite: 1 });
				}
			});
		} else {
			this.props.setSnackbar(
				"Сервис уже в избранном! Спасибо ❤️",
				2000,
				true
			);
		}
	}

	onRefresh() {
		this.setState({ fetching: true, btn: "Обновляем..." });
		fetch2("getRating").then((data) => {
			if (data.result !== "flood" && data.result.length > 0) {
				let raiting = [];
				let number = 1;
				data.result.map((el) => {
					raiting.push(
						<a
							key={el.id}
							target="_blank"
							onClick={() => {
								this.props.clickOnLink;
							}}
							href={"https://vk.com/id" + el.user_id}
						>
							<RichCell
								before={<Avatar size={48} src={el.photo_200} />}
								caption={"Сокращено ссылочек: " + el.points}
								after={"#" + number + " Место"}
							>
								{el.name}
							</RichCell>
						</a>
					);
					number = number + 1;
				});
				this.setState({ raiting: raiting, btn: "Обновить топ" });
				this.props.setSnackbar("Рейтинг успешно обновлён!", 2000, true);
				setTimeout(() => {
					this.setState({ fetching: false });
				}, 300);
			} else {
				setTimeout(() => {
					this.setState({ fetching: false, btn: "Обновить топ" });
				}, 300);
				this.props.setSnackbar(
					"Эй, полегче! Повтори это действие через несколько секунд.",
					2000,
					false
				);
			}
		});
	}

	validate(textval) {
		if (textval.trim().length !== 0) {
			var urlregex = new RegExp(
				/[a-zA-Zа-яА-ЯёЁ0-9_-]+(\.[a-zA-Zа-яА-ЯёЁ0-9_-]+)*\.[a-zA-Zа-яА-ЯёЁ]{2,7}(?=$|[^a-zA-Zа-яА-ЯёЁ0-9_-])/g
			);
			var http = new RegExp(/http:\/\//gm);
			var protocol = "https";
			if (urlregex.test(textval.trim())) {
				if (http.test(textval.trim())) protocol = "http";
				else protocol = "https";
				if (
					this.state.blacklisted.includes(
						new URL(
							"https://" +
								textval
									.replace(/(^\w+|^)/, "")
									.replace(/:\/\//, "")
						).hostname.replace("www.", "")
					)
				)
					this.setState({
						formstatus: {
							bottom:
								"Хочешь сократить уже сокращённую ссылку? Забавно!",
							status: "error",
							url: "",
						},
						url: textval.trim(),
					});
				else {
					this.setState({
						formstatus: {
							bottom: "",
							status: "default",
							protocol: protocol,
							url: textval.trim(),
						},
						url: textval.trim(),
					});
				}
			} else
				this.setState({
					formstatus: {
						bottom: "Введи нормальную ссылку, камон!",
						status: "error",
						url: "",
					},
					url: textval.trim(),
				});
		} else
			this.setState({
				url: textval.trim(),
				formstatus: {
					bottom: "",
					status: "default",
					url: textval.trim(),
					url: "",
				},
			});
	}

	openPage(e) {
		this.setState({ activeStory: e.currentTarget.dataset.story });
	}

	render() {
		let { id, snackbar } = this.props;
		return (
			<Panel id={id} className="homePage">
				{this.state.spinner === false && (
					<Epic
						activeStory={this.state.activeStory}
						tabbar={
							<Tabbar>
								<TabbarItem
									selected={
										this.state.activeStory === "links"
									}
									data-story="links"
									onClick={this.openPage}
									text="Сокращатель"
								>
									<FaLink />
								</TabbarItem>
								<TabbarItem
									selected={
										this.state.activeStory === "history"
									}
									data-story="history"
									onClick={this.openPage}
									text="История"
								>
									<FaHistory />
								</TabbarItem>
								<TabbarItem
									selected={
										this.state.activeStory === "raiting"
									}
									data-story="raiting"
									onClick={this.openPage}
									text="Рейтинг"
								>
									<FaStar />
								</TabbarItem>
								<TabbarItem
									selected={
										this.state.activeStory === "about"
									}
									data-story="about"
									onClick={this.openPage}
									text="О сервисе"
								>
									<FaInfoCircle />
								</TabbarItem>
							</Tabbar>
						}
					>
						<Panel id="links" activeStory="links">
							<PanelHeader separator={false}>
								Сокращатель
							</PanelHeader>
							{this.props.user !== null && (
								<Group separator="hide">
									<RichCell
										before={
											<Avatar
												size={48}
												src={this.props.user.photo_200}
											/>
										}
										caption={
											"Сокращено ссылочек: " +
											this.state.points
										}
										disabled
									>
										{this.props.user.first_name}{" "}
										{this.props.user.last_name}
									</RichCell>
								</Group>
							)}
							<Group style={{ marginTop: "-20px" }}>
								<FormLayout
									onSubmit={(e) => {
										e.preventDefault();
										if (
											this.state.url !== "" &&
											this.props.disabled !== true &&
											this.state.formstatus.status ===
												"default" &&
											this.state.url !==
												this.state.shortened &&
											this.state.service !== ""
										) {
											this.setState({
												disabled: true,
												url: "Колдуем...",
												formDisabled: true,
											});
											fetch2(
												"getShortLink",
												"serivce=" +
													encodeURI(
														this.state.service
													) +
													"&url=" +
													encodeURI(
														this.state.formstatus
															.protocol +
															"://" +
															this.state.formstatus.url
																.replace(
																	/[#]/gi,
																	"~TAG~"
																)
																.replace(
																	/(^\w+:|^)\/\//,
																	""
																)
																.replace(
																	/[&]/gi,
																	"%"
																)
													)
											)
												.then((data) => {
													if (
														data.result !==
															"flood" &&
														data.result !==
															"wrong_url" &&
														data.result !==
															"max_length"
													) {
														if (
															data.result
																.already_shortened ==
															false
														) {
															let url = this.state
																.formstatus.url;
															let arr = [];
															if (
																this.state.links
																	.length == 0
															) {
																arr.push(
																	<ContentCard
																		subtitle={
																			messages[
																				Math.floor(
																					Math.random() *
																						(messages.length -
																							0)
																				) +
																					0
																			]
																		}
																		header={
																			data
																				.result
																				.url
																		}
																		onClick={() => {
																			this.props.setActiveModal(
																				"link",
																				{
																					shortened:
																						data
																							.result
																							.url,
																					link: url,
																				}
																			);
																		}}
																		caption={
																			"Оригинал: " +
																			url
																		}
																	/>
																);
															} else {
																if (
																	this.state
																		.links
																		.length >=
																	50
																) {
																	let arr = this
																		.state
																		.links;
																	arr.splice(
																		-1,
																		1
																	);
																	this.setState(
																		{
																			links: arr,
																		}
																	);
																}
																arr = this.state
																	.links;
																arr.unshift(
																	<ContentCard
																		subtitle={
																			messages[
																				Math.floor(
																					Math.random() *
																						(messages.length -
																							0)
																				) +
																					0
																			]
																		}
																		header={
																			data
																				.result
																				.url
																		}
																		onClick={() => {
																			this.props.setActiveModal(
																				"link",
																				{
																					shortened:
																						data
																							.result
																							.url,
																					link: url,
																				}
																			);
																		}}
																		caption={
																			"Оригинал: " +
																			url
																		}
																	/>
																);
															}
															this.setState({
																url:
																	data.result
																		.url,
																formDisabled: false,
																points:
																	Number(
																		this
																			.state
																			.points
																	) + 1,
																links: arr,
																formstatus: {
																	bottom:
																		"Ссылочка успешно сокращена! Мы, кстати, закинули её в твой буфер обмена.",
																	status:
																		"valid",
																},
															});
														} else {
															this.setState({
																url:
																	data.result
																		.url,
																formDisabled: false,
																formstatus: {
																	bottom:
																		"Мы уже сокращали эту ссылочку для тебя, поэтому балл не засчитаем! Мы, кстати, закинули её в твой буфер обмена.",
																	status:
																		"default",
																},
															});
														}
														this.setState({
															shortened:
																data.result.url,
														});
														bridge.send(
															"VKWebAppCopyText",
															{
																text:
																	data.result
																		.url,
															}
														);
													} else if (
														data.result ===
														"wrong_url"
													) {
														this.setState({
															formstatus: {
																bottom:
																	"Не-а. Введи что-нибудь другое!",
																status: "error",
															},
															url: this.state
																.formstatus.url,
															formDisabled: false,
														});
													} else if (
														data.result === "flood"
													) {
														this.setState({
															formstatus: {
																bottom: "",
																status:
																	"default",
																url: this.state
																	.formstatus
																	.url,
															},
															url: this.state
																.formstatus.url,
															formDisabled: false,
														});
														this.props.setSnackbar(
															"Попробуй повторить действие через несколько секунд, флудить - плохо!",
															2000,
															false
														);
														this.props.blockButton();
													} else if (
														data.result ===
														"max_length"
													) {
														this.setState({
															formstatus: {
																bottom:
																	"Длина ссылки не должна быть более 400 символов!",
																status: "error",
																url: this.state
																	.formstatus
																	.url,
															},
															url: this.state
																.formstatus.url,
															formDisabled: false,
														});
													} else {
														this.setState({
															formstatus: {
																bottom:
																	"Не-а. Введи что-нибудь другое!",
																status: "error",
															},
															url: this.state
																.formstatus.url,
															formDisabled: false,
														});
													}
												})
												.catch(() => {
													this.setState({
														formstatus: {
															bottom:
																"Не-а. Введи что-нибудь другое!",
															status: "error",
														},
														url: this.state
															.formstatus.url,
														formDisabled: false,
													});
												});
										}
									}}
								>
									<FormItem
										top="Ссылочка, которую нужно сократить"
										status={this.state.formstatus.status}
										bottom={this.state.formstatus.bottom}
									>
										<Input
											type="text"
											maxLength="400"
											disabled={
												this.state.formDisabled
													? true
													: false
											}
											value={this.state.url}
											onChange={(e) => {
												this.validate(e.target.value);
											}}
											placeholder="https://vk.com/darkflamept (до 400 символов)"
										/>
									</FormItem>

									<FormItem top="Сервис, через который мы сократим ссылку">
										<Select
											value={this.state.service}
											disabled={
												this.state.formDisabled
													? true
													: false
											}
											onChange={(e) => {
												this.setState({
													service: e.target.value,
												});
											}}
											options={[
												{
													value: "ok.me",
													label: "ok.me",
												},
												{
													value: "bit.ly",
													label: "bit.ly",
												},
												{
													value: "cutt.ly",
													label: "cutt.ly",
												},
												{
													value: "is.gd",
													label: "is.gd",
												},
												{
													value: "hideuri.com",
													label: "hideuri.com",
												},
											]}
										/>
									</FormItem>
									<FormItem>
										<Button
											size="l"
											stretched
											type={"submit"}
											onClick={() => {
												this.props.blockButton();
											}}
											disabled={
												this.state.formstatus.status !==
													"default" ||
												this.state.formstatus.url ===
													"" ||
												this.state.service === "" ||
												this.props.disabled === true ||
												this.state.url ===
													this.state.shortened
													? true
													: false
											}
										>
											Сократить
										</Button>
									</FormItem>
								</FormLayout>
							</Group>
						</Panel>
						<Panel id="history" activeStory="history">
							<PanelHeader
								separator={false}
								style={{ marginBottom: 5 }}
							>
								История ссылок
							</PanelHeader>
							<CardGrid size="l" style={{ marginBottom: 10 }}>
								{this.state.links.length > 0 &&
									this.state.links}
								{this.state.links.length <= 0 && (
									<div>
										<ContentCard
											subtitle="Ну давай, сократи ссылочку!"
											header="https://домен/адрес"
											disabled
											style={{ width: "95vw" }}
											caption="Как только ты сократишь хотя бы одну ссылочку — она появится здесь"
										/>
										<ContentCard
											subtitle="Ты сможешь! Мы в тебя верим!"
											header="https://домен/адрес"
											disabled
											style={{ width: "95vw" }}
											caption="Как только ты сократишь хотя бы одну ссылочку — она появится здесь"
										/>
										<ContentCard
											subtitle="Ну пожалуйста, сократи!!!"
											header="https://домен/адрес"
											disabled
											style={{ width: "95vw" }}
											caption="Как только ты сократишь хотя бы одну ссылочку — она появится здесь"
										/>
										<ContentCard
											subtitle="БЫСТРЕЕ ДАВАЙ УЖЕ СОКРАЩАЙ!"
											header="https://домен/адрес"
											disabled
											style={{ width: "95vw" }}
											caption="Как только ты сократишь хотя бы одну ссылочку — она появится здесь"
										/>
									</div>
								)}
							</CardGrid>
						</Panel>
						<Panel id="raiting" activeStory="raiting">
							<PanelHeader separator={false}>Рейтинг</PanelHeader>
							<PullToRefresh
								onRefresh={this.onRefresh}
								isFetching={this.state.fetching}
							>
								{this.props.user !== null && (
									<Group
										separator="hide"
										header={
											<Header mode="secondary">
												Твоя статистика
											</Header>
										}
									>
										<RichCell
											before={
												<Avatar
													size={48}
													src={
														this.props.user
															.photo_200
													}
												/>
											}
											caption={
												"Сокращено ссылочек: " +
												this.state.points
											}
											disabled
										>
											{this.props.user.first_name}{" "}
											{this.props.user.last_name}
										</RichCell>
									</Group>
								)}
								<Group
									header={
										<Header
											mode="secondary"
											aside={
												<Button
													mode="secondary"
													onClick={() => {
														this.onRefresh();
														this.props.clickOnLink();
													}}
												>
													{this.state.btn}
												</Button>
											}
										>
											Топ-100
										</Header>
									}
								>
									{this.state.raiting}
								</Group>
							</PullToRefresh>
						</Panel>
						<Panel id="about" activeStory="about">
							{platform() !== "ios" && (
								<PanelHeader separator={false}>
									О сервисе
								</PanelHeader>
							)}
							{platform() === "ios" && (
								<div>
									<PanelHeader
										separator={false}
										left={
											<PanelHeaderButton
												style={{ marginLeft: 10 }}
												onClick={() => {
													this.addToFavorites();
												}}
											>
												{this.state.isFavorite == 0 && (
													<Icon28LikeOutline />
												)}{" "}
												{this.state.isFavorite == 1 && (
													<Icon28LikeCircleFillRed />
												)}{" "}
											</PanelHeaderButton>
										}
									>
										О сервисе
									</PanelHeader>
								</div>
							)}
							<Group>
								<CardGrid size="l">
									<ContentCard
										subtitle="ОПИСАНИЕ СЕРВИСА"
										disabled
										header="Что это за сервис такой?"
										text="Это сервис, благодаря которому любая длинная ссылочка становится короткой. Чистая магия."
										maxheight={200}
									/>
									<ContentCard
										subtitle="НЕМНОГО ПРО СОКРАЩЕНИЯ"
										disabled
										header="Что сервис не сокращает?"
										text="Сервис не сокращает: почтовые ссылки (mailto:email@domain.ru), IP-адреса, Linkmoji."
										maxheight={200}
									/>
									<ContentCard
										subtitle="ДРУГАЯ ИНФОРМАЦИЯ"
										disabled
										header="Блокировка Bit.ly"
										text="Обращаем твоё внимание на то, что многие провайдеры в России заблокировали сервис bit.ly. Поэтому сокращать ссылки через этот сервис мы не рекомендуем."
										maxheight={200}
									/>
									<ContentCard
										subtitle="ИНФОРМАЦИЯ О ПРИЛОЖЕНИИ"
										disabled
										header="Приложение"
										text="Текущая версия приложения: 1.1.0. Разработчик: Никита Балин"
										maxheight={200}
									/>
									<ContentCard
										subtitle="ДРУГИЕ СЕРВИСЫ РАЗРАБОТЧИКА"
										text="Нажми на любую из иконок, и сервис откроется."
										disabled
										maxheight={200}
									/>
								</CardGrid>
								<Div style={{ marginBottom: -10 }}>
									<SimpleCell
										onClick={() => {
											bridge.send("VKWebAppOpenApp", {
												app_id: 7722891,
											});
										}}
										after={<Icon28ChevronRightOutline />}
										before={
											<Avatar mode="image" src={img1} />
										}
										description="Просмотр аркад, скриншотов, мемов и милых артов с котиком Бригитты."
									>
										Overwatch Hub
									</SimpleCell>
									<SimpleCell
										onClick={() => {
											bridge.send("VKWebAppOpenApp", {
												app_id: 7784361,
											});
										}}
										after={<Icon28ChevronRightOutline />}
										before={
											<Avatar mode="image" src={img2} />
										}
										description="С красивеньким виджетом в группу!"
									>
										Мониторинг игровых серверов
									</SimpleCell>
								</Div>
								<Div>
									<Button
										size="l"
										onClick={() => {
											this.props.clickOnLink;
										}}
										stretched
										className="fixButton"
										mode="secondary"
										href="https://vk.com/write172118960"
										target="_blank"
									>
										Написать разработчику
									</Button>
								</Div>
							</Group>
						</Panel>
					</Epic>
				)}
				{snackbar}
				{this.state.spinner === true && <ScreenSpinner size="large" />}
			</Panel>
		);
	}
}

export default Home;
