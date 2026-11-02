import {defineMessages} from 'react-intl';
import sharedMessages from '../shared-messages';

let messages = defineMessages({
    meow: {
        defaultMessage: 'Meow',
        description: 'Name for the meow sound',
        id: 'gui.defaultProject.meow'
    },
    variable: {
        defaultMessage: 'my variable',
        description: 'Name for the default variable',
        id: 'gui.defaultProject.variable'
    }
});

messages = {...messages, ...sharedMessages};

// use the default message if a translation function is not passed
const defaultTranslator = msgObj => msgObj.defaultMessage;

/**
 * Generate a localized version of the default project
 * @param {function} translateFunction a function to use for translating the default names
 * @return {object} the project data json for the default project
 */
const projectData = translateFunction => {
    const translator = translateFunction || defaultTranslator;
    return ({
        targets: [
            {
                isStage: true,
                name: 'Stage',
                variables: {
                    '`jEk@4|i[#Fk?(8x)AV.-my variable': [
                        translator(messages.variable),
                        0
                    ]
                },
                lists: {},
                broadcasts: {},
                blocks: {},
                currentCostume: 0,
                costumes: [
                    {
                        assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
                        name: translator(messages.backdrop, {index: 1}),
                        md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
                        dataFormat: 'svg',
                        rotationCenterX: 240,
                        rotationCenterY: 180
                    }
                ],
                sounds: [
                    {
                        assetId: '83a9787d4cb6f3b7632b4ddfebf74367',
                        name: translator(messages.pop),
                        dataFormat: 'wav',
                        format: '',
                        rate: 11025,
                        sampleCount: 258,
                        md5ext: '83a9787d4cb6f3b7632b4ddfebf74367.wav'
                    }
                ],
                volume: 100
            },
            {
                isStage: false,
                name: 'Qubit1',
                variables: {},
                lists: {},
                broadcasts: {},
                blocks: {},
                currentCostume: 0,
                costumes: [
                    {
                        assetId: 'd3e828697fd4339cf404d8ff755925a0',
                        name: 'Qubit1_1',
                        bitmapResolution: 2,
                        md5ext: 'd3e828697fd4339cf404d8ff755925a0.png',
                        dataFormat: 'png',
                        rotationCenterX: 120,
                        rotationCenterY: 103
                    },
                    {
                        assetId: 'fc88e38b3f1ee02d7b65f34b5176b154',
                        name: 'Qubit1_2',
                        bitmapResolution: 2,
                        md5ext: 'fc88e38b3f1ee02d7b65f34b5176b154.png',
                        dataFormat: 'png',
                        rotationCenterX: 120,
                        rotationCenterY: 105
                    },
                    {
                        assetId: '1379658c9b4bd4de381ed893ae75816f',
                        name: 'Qubit1_3',
                        bitmapResolution: 2,
                        md5ext: '1379658c9b4bd4de381ed893ae75816f.png',
                        dataFormat: 'png',
                        rotationCenterX: 120,
                        rotationCenterY: 103
                    },
                    {
                        assetId: 'e532dcf3ed7d0e54821f0c47e1186312',
                        name: 'Qubit1_4',
                        bitmapResolution: 2,
                        md5ext: 'e532dcf3ed7d0e54821f0c47e1186312.png',
                        dataFormat: 'png',
                        rotationCenterX: 120,
                        rotationCenterY: 95
                    },
                    {
                        assetId: '39fc6371830f1827eef4467f757f66ae',
                        name: 'Qubit1_5',
                        bitmapResolution: 2,
                        md5ext: '39fc6371830f1827eef4467f757f66ae.png',
                        dataFormat: 'png',
                        rotationCenterX: 120,
                        rotationCenterY: 105
                    },
                    {
                        assetId: '6ee0c10bc04751aeecddf36651e05118',
                        name: 'Qubit1_6',
                        bitmapResolution: 2,
                        md5ext: '6ee0c10bc04751aeecddf36651e05118.png',
                        dataFormat: 'png',
                        rotationCenterX: 120,
                        rotationCenterY: 110
                    }
                ],
                sounds: [
                    {
                        assetId: '83c36d806dc92327b9e7049a565c6bff',
                        name: translator(messages.meow),
                        dataFormat: 'wav',
                        format: '',
                        rate: 22050,
                        sampleCount: 18688,
                        md5ext: '83c36d806dc92327b9e7049a565c6bff.wav'
                    }
                ],
                volume: 100,
                visible: true,
                x: 0,
                y: 0,
                size: 100,
                direction: 90,
                draggable: false,
                rotationStyle: 'all around'
            }
        ],
        meta: {
            semver: '3.0.0',
            vm: '0.1.0',
            agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' // eslint-disable-line max-len
        }
    });
};


export default projectData;
