const { expect } = require('chai');

const { LoadUtils } = require('../../src/util/Injected/Utils');

function createChat({ isGroup = false, isLid = false, isLidAddressingMode }) {
    return {
        id: {
            isGroup: () => isGroup,
            isLid: () => isLid,
        },
        groupMetadata:
            isLidAddressingMode === undefined
                ? undefined
                : { isLidAddressingMode: isLidAddressingMode },
    };
}

describe('Injected message sender selection', function () {
    let previousWindow;

    beforeEach(function () {
        previousWindow = global.window;
        global.window = { require: () => null };
        LoadUtils();
    });

    afterEach(function () {
        global.window = previousWindow;
    });

    it('uses the phone identity for direct LID chats', function () {
        const chat = createChat({ isLid: true });

        expect(
            window.WWebJS.getMessageSender(chat, 'lid-user', 'phone-user'),
        ).to.equal('phone-user');
    });

    it('keeps LID addressing for LID-mode groups', function () {
        const chat = createChat({
            isGroup: true,
            isLidAddressingMode: true,
        });

        expect(
            window.WWebJS.getMessageSender(chat, 'lid-user', 'phone-user'),
        ).to.equal('lid-user');
    });

    it('uses the phone identity for phone-addressed groups', function () {
        const chat = createChat({
            isGroup: true,
            isLidAddressingMode: false,
        });

        expect(
            window.WWebJS.getMessageSender(chat, 'lid-user', 'phone-user'),
        ).to.equal('phone-user');
    });
});
