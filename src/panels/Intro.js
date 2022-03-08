import React, { Fragment } from "react";
import { Panel, Group, Div, Title, Text, Button } from "@vkontakte/vkui";

import "../css/Intro.css";

import Slide1 from "../img/slide1.svg";

const Intro = ({ id, snackbar, user, userHasSeenIntro, go }) => {
	return (
		<Panel id={id} centered={true} className="noScroll">
			{!userHasSeenIntro && user && (
				<Fragment>
					<Group>
						<Div className="WelcomeBlock">
							<img
								src={Slide1}
								width="100%"
								style={{ marginBottom: -30 }}
							/>
							<Title
								level="1"
								weight="bold"
								style={{ marginBottom: 16 }}
							>
								{user.first_name}, добро пожаловать в лучшие
								ссылочки на планете Земля!
							</Title>
							<Text weight="regular">
								Благодаря этому приложению ты в любой момент
								времени можешь превратить длинную ссылочку в
								короткую. А еще мы поддерживаем несколько
								сервисов сразу!
							</Text>
							<Button
								size="l"
								stretched
								mode="secondary"
								onClick={go}
							>
								Начнём!
							</Button>
						</Div>
					</Group>
				</Fragment>
			)}
			{snackbar}
		</Panel>
	);
};

export default Intro;
