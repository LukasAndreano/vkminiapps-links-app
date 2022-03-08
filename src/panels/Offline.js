import React, { Fragment } from "react";
import { Panel, Group, Div, Title, Text, Avatar } from "@vkontakte/vkui";

import { Icon36LightbulbOutline } from "@vkontakte/icons";

import "../css/Intro.css";

const Textpage = ({ id }) => {
	return (
		<Panel id={id} centered={true}>
			<Fragment>
				<Group>
					<Div className="WelcomeBlock">
						<Avatar size={64}>
							<Icon36LightbulbOutline />
						</Avatar>
						<Title
							level="1"
							weight="bold"
							style={{ marginBottom: 16 }}
						>
							Ах-ох! Что произошло?
						</Title>
						<Text weight="regular">
							К сожалению, сервис потерял коннект с тобой. Как
							только всё придёт в норму - мы тебя вернём обратно в
							сервис.
						</Text>
					</Div>
				</Group>
			</Fragment>
		</Panel>
	);
};

export default Textpage;
