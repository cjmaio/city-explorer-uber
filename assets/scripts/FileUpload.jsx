import React from 'react'
import Spinner from './Spinner'

export default React.createClass({
    getInitialState() {
        return { file: '', loading: false };
    },
    handleChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = () => {
            this.setState({
                file: file
            });
        }

        reader.readAsDataURL(file);
    },
    handleSubmit(e) {
        e.preventDefault();

        let imageFormData = new FormData();
        imageFormData.append('file', this.state.file);

        var xhr = new XMLHttpRequest();
        xhr.open('post', '/importfile', true);
        xhr.onload = () => {
            this.setState((previous, current) => {
                return { file: previous.file, loading: false }
            });
            if (this.status == 200) {
                console.log(this.response);
            } else {
                console.log(this.statusText);
            }
        };

        this.setState((previous, current) => {
            return { file: previous.file, loading: true }
        });

        xhr.send(imageFormData);
    },
    render() {
        return (
            <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                <input type="file" onChange={this.handleChange} />
                <br />
                <button className="btn small solid blue" type="submit" onClick={this.handleSubmit} disabled={this.state.loading}>
                    { this.state.loading ? <Spinner /> : null } { this.state.loading ? 'Importing...' : 'Upload' }
                </button>
            </form>
        )
    }
})
