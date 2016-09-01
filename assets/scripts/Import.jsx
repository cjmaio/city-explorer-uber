import React from 'react'
import FileUpload from './FileUpload'

export default React.createClass({
    render() {
        return (
            <div>
                <p>Use the upload form below to import new data into the database.</p>
                <p><span className="bold">Note:</span> The import process may take a while; do not leave this page while the process is running.</p>
                <FileUpload />
            </div>
        )
    }
})
