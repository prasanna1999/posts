import React from "react";
import axios from "axios";
import './posts.css';
import { Checkbox, Dialog, Icon, DialogFooter, PrimaryButton, DefaultButton, TextField, DialogType } from "@fluentui/react";
import { initializeIcons } from '@fluentui/react/lib/Icons';
import ReactPaginate from 'react-paginate';
import Post from './Post';
import _ from 'lodash';
initializeIcons();
export default class Posts extends React.Component {
    itemsPerPage = 10;
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            searchValue: '',
            filteredPosts: [],
            currentItems: [],
            pageCount: 0,
            itemOffset: 0,
            isEdit: false,
            editedPost: null,
            checkedIds: [],
            isSelectAllChecked: false,
            errMsgs: [],
            isAdd: false
        }
    }
    componentDidMount() {
        axios.get('https://jsonplaceholder.typicode.com/posts').then((response) => {
            if (response) {
                let endOffset = this.state.itemOffset + this.itemsPerPage;
                this.setState({
                    posts: response.data,
                    filteredPosts: response.data,
                    searchValue: '',
                    currentItems: response.data.slice(this.state.itemOffset, endOffset),
                    pageCount: (Math.ceil(response.data.length / this.itemsPerPage)),
                    editedPost: null
                });
            }
        })
    }

    handleChange = (e) => {
        let searchedValue = e.target.value;
        let endOffset = this.state.itemOffset + this.itemsPerPage;
        this.setState({ searchValue: searchedValue });
        searchedValue = searchedValue.toLowerCase();
        if (searchedValue.length > 0) {
            let filteredPosts = this.state.posts.filter(
                (post) => post.title.toLowerCase().includes(searchedValue) ||
                    post.postId.toLowerCase().includes(searchedValue) ||
                    post.body.toLowerCase().includes(searchedValue)
            );
            this.setState({
                filteredPosts: filteredPosts,
                currentItems: filteredPosts.slice(this.state.itemOffset, endOffset),
                pageCount: (Math.ceil(filteredPosts.length / this.itemsPerPage))
            });
        }
        else
            this.setState({
                filteredPosts: this.state.posts,
                currentItems: this.state.posts.slice(this.state.itemOffset, endOffset),
                pageCount: (Math.ceil(this.state.posts.length / this.itemsPerPage))
            });
    }

    handleEdit = (id) => {
        let _editedPost = this.state.posts.filter((post) => post.id == id)[0];
        this.setState({ isEdit: true, editedPost: _editedPost });
    }

    handleEditChange = (e) => {
        let id = e.target.id;
        let val = e.target.value;
        let errMsg = this.validate(id, val);
        let _post = _.clone(this.state.editedPost);
        if(!_post){
            _post = {userId:1}
        }
        _post[id] = e.target.value;
        
        let _errMsgs = this.state.errMsgs;
        _errMsgs[id] = errMsg;
        this.setState({ editedPost: _post, errMsgs: _errMsgs });
    }

    validate = (id, val) => {
        switch (id) {
            case 'title':
                if (val.length == 0)
                    return 'Title is required';
                break;
            case 'body':
                if (val.length == 0)
                    return 'Body is required';
                break;
            default:
                return null;
        }
    }

    handleUpdate = () => {
        let id = this.state.editedPost.id;

        let index = this.state.posts.findIndex((_post) => _post.id == id);
        let _posts = this.state.posts;
        _posts[index] = this.state.editedPost;
        let endOffset = this.state.itemOffset + this.itemsPerPage;
        this.setState({
            posts: _posts,
            filteredPosts: _posts,
            currentItems: _posts.slice(this.state.itemOffset, endOffset),
            isEdit: false,
            searchValue: '',
            editedPost: null
        });
    }

    handleAdd = () =>{
        let id = this.state.posts.length+1;
        let _posts = this.state.posts;
        _posts.push(this.state.editedPost);
        let endOffset = this.state.itemOffset + this.itemsPerPage;
        this.setState({
            posts: _posts,
            filteredPosts: _posts,
            currentItems: _posts.slice(this.state.itemOffset, endOffset),
            isAdd: false,
            searchValue: '',
            editedPost: null,
            pageCount: (Math.ceil(_posts.length / this.itemsPerPage))
        });
    }

    handleDelete = (id) => {
        let _posts = this.state.posts.filter((post) => post.id != id);
        let endOffset = this.state.itemOffset + this.itemsPerPage;
        this.setState({
            posts: _posts,
            filteredPosts: _posts,
            currentItems: _posts.slice(this.state.itemOffset, endOffset),
            pageCount: (Math.ceil(_posts.length / this.itemsPerPage))
        })
    }

    handlePageClick = (event) => {
        const newOffset = (event.selected * this.itemsPerPage) % this.state.filteredPosts.length;
        console.log(
            `Post requested page number ${event.selected}, which is offset ${newOffset}`
        );
        this.setState({ itemOffset: newOffset });
        const endOffset = newOffset + this.itemsPerPage;
        this.setState({
            itemOffset: newOffset,
            currentItems: this.state.filteredPosts.slice(newOffset, endOffset),
            pageCount: Math.ceil(this.state.filteredPosts.length / this.itemsPerPage),
            checkedIds: [],
            isSelectAllChecked: false
        });
    };

    handleSelectAll = (e) => {
        this.setState({
            isSelectAllChecked: !this.state.isSelectAllChecked,
            checkedIds: e.target.checked ? this.state.currentItems.map((post) => { return post.id }) : []
        })
    }

    handleSelectChange = (id) => {
        let _isChecked = this.state.checkedIds.findIndex(_id => _id == id) >= 0;
        let _checkedIds = _.clone(this.state.checkedIds);
        if (_isChecked) {
            this.setState({
                checkedIds: this.state.checkedIds.filter(_id => _id != id),
                isSelectAllChecked: false
            })
        }
        else {
            _checkedIds.push(id);
            this.setState({ checkedIds: _checkedIds })
        }
    }

    deleteSelected = () => {
        let _posts = _.clone(this.state.posts);
        _posts = _posts.filter((post) => this.state.checkedIds.findIndex(item => item == post.id) >= 0 ? false : true);
        let endOffset = this.state.itemOffset + this.itemsPerPage;
        this.setState({
            posts: _posts,
            filteredPosts: _posts,
            searchValue: '',
            currentItems: _posts.slice(this.state.itemOffset, endOffset),
            pageCount: (Math.ceil(_posts.length / this.itemsPerPage)),
            editedPost: null,
            checkedIds: [],
            isSelectAllChecked: false
        });
    }

    render() {
        return <div className='postsContainer'>
            <div>
                <TextField
                    placeholder="Search"
                    onChange={this.handleChange}
                    value={this.state.searchValue}
                    className="searchBar"
                />
                <PrimaryButton text='Add' onClick={() => this.setState({ isAdd: true })} />
            </div>
            <div className="ms-Grid-row post heading">
                <Checkbox className="ms-Grid-col ms-sm1 checkbox" onChange={this.handleSelectAll} checked={this.state.isSelectAllChecked} />
                <div className="ms-Grid-col ms-sm5 ms-md5 ms-xl3 name">Title</div>
                <div className="ms-Grid-col ms-sm6 ms-md5 ms-xl3 email">User Id</div>
                <div className="ms-Grid-col ms-sm6 ms-md5 ms-xl3 role">Body</div>
                <div className="ms-Grid-col ms-sm6 ms-md6 ms-xl2 actions">Actions</div>
            </div>
            {this.state.currentItems.map(post => {
                return <Post
                    post={post}
                    isSelected={this.state.checkedIds && this.state.checkedIds.filter((_id) => _id == post.id) && this.state.checkedIds.filter((_id) => _id == post.id)[0] >= 0 ? true : false}
                    onpostSelected={() => this.handleSelectChange(post.id)}
                    onEditSelected={() => this.handleEdit(post.id)}
                    onDeleteSelected={() => this.handleDelete(post.id)}
                />

            })}
            <Dialog
                hidden={!(this.state.isEdit||this.state.isAdd)}
                modalProps={{
                    isBlocking: true,
                    containerClassName: `ms-dialogMainOverride`
                }}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: 'Update Post'
                }}
                minWidth={600}
            >
                <div>
                    <TextField id='title' value={this.state.editedPost?.title} onChange={this.handleEditChange} placeholder='Name' errorMessage={this.state.errMsgs.title} />
                    <TextField multiline='true' autoAdjustHeight id='body' value={this.state.editedPost?.body} onChange={this.handleEditChange} placeholder='Body' errorMessage={this.state.errMsgs.body} />
                </div>
                <DialogFooter>
                    <PrimaryButton
                        onClick={this.state.isEdit?this.handleUpdate:this.handleAdd}
                        text={`${this.state.isEdit?'Update':'Add'}`}
                        disabled={!(this.state.errMsgs.title == undefined && this.state.errMsgs.postId == undefined && this.state.errMsgs.body == undefined)}
                    />
                    <DefaultButton
                        onClick={() => { this.setState({ isEdit: false, isAdd: false, editedPost: null }) }}
                        text='Cancel'
                    />
                </DialogFooter>
            </Dialog>
            <PrimaryButton text={'Delete Selected'} onClick={this.deleteSelected} disabled={!this.state.checkedIds.length} className="deleteSelected" />
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={this.handlePageClick}
                pageRangeDisplayed={5}
                pageCount={this.state.pageCount}
                previousLabel="<"
                renderOnZeroPageCount={null}
                className='paginate'
                pageLinkClassName='paginateItem'
                activeLinkClassName="selectedPaginateItem"
                previousLinkClassName='paginateItem'
                nextLinkClassName="paginateItem"
                previousClassName="paginateLi"
                nextClassName="paginateLi"
                pageClassName="paginateLi"
            />
        </div>
    }
}