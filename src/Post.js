import React from "react";
import { Checkbox, Icon } from "@fluentui/react";
import { initializeIcons } from '@fluentui/react/lib/Icons';
import './post.css';

initializeIcons();
export default function Post(props) {
    return <div className='ms-Grid-row post'>
            <Checkbox
                className="ms-Grid-col ms-sm1 checkbox"
                id={props.post.id}
                checked={props.isSelected}
                onChange={props.onPostSelected}
            />
            <div className="ms-Grid-col ms-sm5 ms-md5 ms-xl3 name">{props.post.title}</div>
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-xl3 email">{props.post.userId}</div>
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-xl3 role">{props.post.body}</div>
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-xl2 actions">
                <Icon iconName="SingleColumnEdit" onClick={props.onEditSelected}></Icon>
                <Icon iconName="Delete" onClick={props.onDeleteSelected} className="delete"></Icon>
            </div>
        </div>
}