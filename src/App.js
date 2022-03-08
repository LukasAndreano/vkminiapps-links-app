import React, { useState } from "react";
import bridge from "@vkontakte/vk-bridge";
import { platform } from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";
import {
	View,
	Snackbar,
	ScreenSpinner,
	ConfigProvider,
	Button,
	ModalCard,
	Div,
	ModalRoot,
} from "@vkontakte/vkui";

import {
	Icon56LinkCircleOutline,
	Icon28CancelCircleFillRed,
	Icon28LinkOutline,
	Icon28CheckCircleFill,
	Icon28CopyOutline,
	Icon28DoneOutline,
} from "@vkontakte/icons";

import "./css/Index.css";

import Home from "./panels/Home";
import Offline from "./panels/Offline";
import Intro from "./panels/Intro";

const ROUTES = {
	HOME: "home",
	OFFLINE: "offline",
	INTRO: "intro",
};

const STORAGE_KEYS = {
	STATUS: "status",
};

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activePanel: ROUTES.HOME,
			popout: <ScreenSpinner size="large" />,
			snackbar: null,
			online: true,
			disabled: false,
			disabledCopy: false,
			theme: "client_light",
			icon: <Icon28CopyOutline />,
			loaded: false,
			data: {
				shortened: null,
				link: null,
			},
			user: null,
			textpage: {
				title: null,
				text: null,
				button: null,
				success: true,
			},
			history: ["home"],
			activeModal: null,
		};
		this.go = this.go.bind(this);
		this.goBack = this.goBack.bind(this);
		this.AndroidBackButton = this.AndroidBackButton.bind(this);
		this.clickOnLink = this.clickOnLink.bind(this);
		this.setActiveModal = this.setActiveModal.bind(this);
		this.openTextPage = this.openTextPage.bind(this);
		this.setSnackbar = this.setSnackbar.bind(this);
		this.setTextpage = this.setTextpage.bind(this);
		this.blockButton = this.blockButton.bind(this);
		this.viewIntro = this.viewIntro.bind(this);
	}

	componentDidMount() {
		bridge.subscribe(({ detail: { type, data } }) => {
			if (type === "VKWebAppUpdateConfig") {
				const schemeAttribute = document.createAttribute("scheme");
				schemeAttribute.value = data.scheme
					? data.scheme
					: "client_light";
				document.body.attributes.setNamedItem(schemeAttribute);
				this.setState({
					theme: data.scheme ? "space_gray" : "client_light",
				});
			}
		});

		bridge.send("VKWebAppGetUserInfo").then((data) => {
			this.setState({ user: data, popout: null });
		});

		bridge
			.send("VKWebAppStorageGet", {
				keys: Object.values(STORAGE_KEYS),
			})
			.then((data) => {
				if (data.keys[0].value !== "true") {
					this.setState({ activePanel: ROUTES.INTRO });
					document.body.style.overflow = "hidden";
				}
			});

		window.addEventListener("popstate", this.AndroidBackButton);

		window.addEventListener("offline", () => {
			bridge.send("VKWebAppDisableSwipeBack");
			this.setActiveModal();
			this.setState({
				online: false,
			});
			document.body.style.overflow = "hidden";
			this.go("offline");
		});

		window.addEventListener("online", () => {
			this.setState({
				online: true,
			});
			document.body.style.overflow = "visible";
			this.go("home");
		});

		setTimeout(() => {
			this.setState({ loaded: true });
		}, 500);
	}

	blockButton(timeout = 2000) {
		setTimeout(() => {
			this.setState({ disabled: true });
			setTimeout(() => {
				this.setState({ disabled: false });
			}, timeout);
		}, 50);
	}

	setSnackbar(text, duration, success) {
		duration = duration || 4000;
		if (success === true) success = <Icon28CheckCircleFill />;
		else success = <Icon28CancelCircleFillRed />;
		this.setState({
			snackbar: (
				<Snackbar
					layout="vertical"
					before={success}
					duration={duration}
					onClose={() => this.setState({ snackbar: null })}
				>
					{text}
				</Snackbar>
			),
		});
	}

	setTextpage(title, text, button, success) {
		if (success === undefined) success = true;
		this.setState({
			textpage: {
				title: title,
				text: text,
				button: button,
				success: success,
			},
		});
		this.go("textpage");
	}

	setActiveModal(activeModal = null, data = null) {
		let modalHistory = this.state.modalHistory
			? [...this.state.modalHistory]
			: [];
		if (data !== null)
			this.setState({
				data: { shortened: data.shortened, link: data.link },
			});
		else
			setTimeout(() => {
				this.setState({
					data: { shortened: null, link: null },
					disabledCopy: false,
					icon: <Icon28CopyOutline />,
				});
			}, 150);
		if (activeModal === null) {
			document.body.style.overflow = "visible";
			modalHistory = [];
		} else if (modalHistory.indexOf(activeModal) !== -1) {
			modalHistory = modalHistory.splice(
				0,
				modalHistory.indexOf(activeModal) + 1
			);
		} else {
			document.body.style.overflow = "hidden";
			modalHistory.push(activeModal);
		}
		this.setState({
			activeModal,
			modalHistory,
		});
	}

	go(panel) {
		if (this.state.online === true) {
			this.setActiveModal(null);
			const history = [...this.state.history];
			history.push(panel);
			if (panel === "home") {
				bridge.send("VKWebAppDisableSwipeBack");
				this.setState({
					history: ["home"],
					activePanel: panel,
				});
			} else {
				this.setState({
					history: history,
					activePanel: panel,
				});
			}
			document.body.style.overflow = "visible";
		} else {
			this.setState({
				activePanel: panel,
			});
		}
	}

	viewIntro() {
		document.body.style.overflow = "visible";
		try {
			bridge.send("VKWebAppStorageSet", {
				key: STORAGE_KEYS.STATUS,
				value: "true",
			});
			this.setState({ activePanel: ROUTES.HOME });
		} catch (error) {
			this.setSnackbar("Упс, что-то пошло не так...", 2000, false);
		}
	}

	goBack = () => {
		if (this.state.activeModal !== null) this.setActiveModal(null);
		const history = [...this.state.history];
		history.pop();
		const activePanel = history[history.length - 1];
		if (activePanel === "home") {
			bridge.send("VKWebAppEnableSwipeBack");
		}
		document.body.style.overflow = "visible";
		this.setState({ history: history, activePanel });
	};

	AndroidBackButton = () => {
		if (
			this.state.activePanel !== ROUTES.HOME &&
			this.state.online === true
		) {
			if (this.state.activeModal !== null) {
				this.setActiveModal(null);
			} else {
				this.goBack();
			}
		} else {
			if (this.state.activeModal !== null) {
				if (this.state.activeModal !== null) {
					this.setActiveModal(null);
				} else {
					bridge.send("VKWebAppClose", { status: "success" });
				}
			}
		}
	};

	openTextPage(title, text, button, success) {
		this.setState({
			textpage: {
				title: title,
				text: text,
				button: button,
				success: success,
			},
		});
		this.go("textpage");
	}

	clickOnLink() {
		document.body.style.pointerEvents = "none";
		setTimeout(() => {
			document.body.style.pointerEvents = "all";
		}, 1000);
	}

	render() {
		const modal = (
			<ModalRoot activeModal={this.state.activeModal}>
				<ModalCard
					id="link"
					onClose={() => {
						this.setActiveModal(null);
					}}
					icon={<Icon56LinkCircleOutline />}
					header={this.state.data.shortened}
					subheader={
						"Оригинал этой супер-дупер сокращённой ссылки: " +
						this.state.data.link
					}
					actions={
						<Div
							style={{
								display: "flex",
								width: "100%",
								marginTop: "-20px",
							}}
						>
							<a
								target="_blank"
								href={
									/^(http|https):/.test(this.state.data.link)
										? this.state.data.link
										: "https://" + this.state.data.link
								}
								onClick={() => {
									this.clickOnLink;
								}}
								style={{ marginRight: 8, width: "50%" }}
							>
								<Button
									size="l"
									stretched
									before={<Icon28LinkOutline />}
								/>
							</a>
							<Button
								size="l"
								stretched
								mode="secondary"
								disabled={
									this.state.disabledCopy ? true : false
								}
								style={{ width: "50%" }}
								onClick={() => {
									bridge.send("VKWebAppCopyText", {
										text: this.state.data.shortened,
									});
									this.setState({
										icon: <Icon28DoneOutline />,
										disabledCopy: true,
									});
								}}
								before={this.state.icon}
							/>
						</Div>
					}
				/>
			</ModalRoot>
		);
		if (platform() !== "ios") history.pushState(null, null);
		return (
			<ConfigProvider isWebView={true} appearance={this.state.theme}>
				{this.state.loaded === true && (
					<View
						activePanel={this.state.activePanel}
						modal={modal}
						popout={this.state.popout}
						onSwipeBack={this.goBack}
						history={this.state.history}
					>
						<Home
							id={ROUTES.HOME}
							go={this.go}
							setActiveModal={this.setActiveModal}
							clickOnLink={this.clickOnLink}
							setSnackbar={this.setSnackbar}
							user={this.state.user}
							blockButton={this.blockButton}
							disabled={this.state.disabled}
							snackbar={this.state.snackbar}
						/>
						<Intro
							id={ROUTES.INTRO}
							go={this.viewIntro}
							user={this.state.user}
						/>
						<Offline id={ROUTES.OFFLINE} />
					</View>
				)}
			</ConfigProvider>
		);
	}
}

export default App;
