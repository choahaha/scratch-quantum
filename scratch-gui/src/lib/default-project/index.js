import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import popWav from '!arraybuffer-loader!./83a9787d4cb6f3b7632b4ddfebf74367.wav?';
import meowWav from '!arraybuffer-loader!./83c36d806dc92327b9e7049a565c6bff.wav?';
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg?';
import qubit1Costume1 from '!arraybuffer-loader!../../../static/quantum-assets/d3e828697fd4339cf404d8ff755925a0.png?';
import qubit1Costume2 from '!arraybuffer-loader!../../../static/quantum-assets/fc88e38b3f1ee02d7b65f34b5176b154.png?';
import qubit1Costume3 from '!arraybuffer-loader!../../../static/quantum-assets/1379658c9b4bd4de381ed893ae75816f.png?';
import qubit1Costume4 from '!arraybuffer-loader!../../../static/quantum-assets/e532dcf3ed7d0e54821f0c47e1186312.png?';
import qubit1Costume5 from '!arraybuffer-loader!../../../static/quantum-assets/39fc6371830f1827eef4467f757f66ae.png?';
import qubit1Costume6 from '!arraybuffer-loader!../../../static/quantum-assets/6ee0c10bc04751aeecddf36651e05118.png?';
/* eslint-enable import/no-unresolved */

const defaultProject = translator => {
    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('fastestsmallesttextencoderdecoder').TextEncoder;
    } else {
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: '83a9787d4cb6f3b7632b4ddfebf74367',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(popWav)
    }, {
        id: '83c36d806dc92327b9e7049a565c6bff',
        assetType: 'Sound',
        dataFormat: 'WAV',
        data: new Uint8Array(meowWav)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: 'd3e828697fd4339cf404d8ff755925a0',
        assetType: 'ImageBitmap',
        dataFormat: 'PNG',
        data: new Uint8Array(qubit1Costume1)
    }, {
        id: 'fc88e38b3f1ee02d7b65f34b5176b154',
        assetType: 'ImageBitmap',
        dataFormat: 'PNG',
        data: new Uint8Array(qubit1Costume2)
    }, {
        id: '1379658c9b4bd4de381ed893ae75816f',
        assetType: 'ImageBitmap',
        dataFormat: 'PNG',
        data: new Uint8Array(qubit1Costume3)
    }, {
        id: 'e532dcf3ed7d0e54821f0c47e1186312',
        assetType: 'ImageBitmap',
        dataFormat: 'PNG',
        data: new Uint8Array(qubit1Costume4)
    }, {
        id: '39fc6371830f1827eef4467f757f66ae',
        assetType: 'ImageBitmap',
        dataFormat: 'PNG',
        data: new Uint8Array(qubit1Costume5)
    }, {
        id: '6ee0c10bc04751aeecddf36651e05118',
        assetType: 'ImageBitmap',
        dataFormat: 'PNG',
        data: new Uint8Array(qubit1Costume6)
    }];
};

export default defaultProject;
