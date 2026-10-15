'use strict';

const Base = require('./Base');
// eslint-disable-next-line no-unused-vars
const Chat = require('./Chat');

/**
 * WhatsApp Business Label information
 */
class Label extends Base {
    /**
     * @param {Base} client
     * @param {object} labelData
     */
    constructor(client, labelData) {
        super(client);

        if (labelData) this._patch(labelData);
    }

    _patch(labelData) {
        /**
         * Label ID
         * @type {string}
         */
        this.id = labelData.id;

        /**
         * Label name
         * @type {string}
         */
        this.name = labelData.name;

        /**
         * Label hex color
         * @type {string}
         */
        this.hexColor = labelData.hexColor;

        /**
         * Label color index
         * @type {number}
         */
        this.colorIndex = labelData.colorIndex;

        /**
         * WhatsApp list type: CUSTOM/PREDEFINED/LEAD are user labels, UNREAD/GROUPS/FAVORITES... are built-in lists
         * @type {number|undefined}
         */
        this.type = labelData.type;

        /**
         * false for lists the user turned off
         * @type {boolean|undefined}
         */
        this.isActive = labelData.isActive;
    }

    /**
     * Get all chats that have been assigned this Label
     * @returns {Promise<Array<Chat>>}
     */
    async getChats() {
        return this.client.getChatsByLabelId(this.id);
    }
}

module.exports = Label;
