'use strict';

/**
 * Helpers that return the serialized string of a WhatsApp ID object and cache
 * it back onto the object as `_serialized`.
 *
 * WhatsApp Web renamed the `_serialized` property to a minified name (`$1`) in
 * its 2026-07 update. Rather than depend on that minified name - which is not
 * stable across bundle versions - every helper reconstructs the serialized
 * string deterministically from the object's own component keys. Resolution
 * order: existing `_serialized` -> reconstruct from keys. The result is written
 * back to `id._serialized` so later reads keep working.
 *
 * These are the Node/server-side helpers. The browser-injected counterpart
 * lives in `src/util/Injected/Utils.js` as `window.WWebJS.GetSerialized`.
 */

function cached(id) {
    if (id == null) return { done: true, value: id };
    if (typeof id === 'string') return { done: true, value: id };
    if (typeof id._serialized === 'string' && id._serialized !== '') {
        return { done: true, value: id._serialized };
    }
    return { done: false, value: null };
}

/**
 * Serializes a Wid (WhatsApp ID): `user[:device]@server`.
 * @param {string|object} id
 * @returns {string|null}
 */
function GetSerializedWid(id) {
    const hit = cached(id);
    if (hit.done) return hit.value;

    let value;
    if (id.user != null && id.server != null) {
        value =
            id.user === 'call'
                ? 'call'
                : `${id.user}` +
                  (id.device ? `:${id.device}` : '') +
                  `@${id.server}`;
    } else {
        value = null;
    }

    if (value != null) {
        id._serialized = value;
    }
    return value == null ? null : value;
}

/**
 * Serializes a MsgKey (message ID): `fromMe_remote_id[_self][_participant]`.
 * @param {string|object} id
 * @returns {string|null}
 */
function GetSerializedMsgKey(id) {
    const hit = cached(id);
    if (hit.done) return hit.value;

    let value;
    if (id.remote != null && id.id != null) {
        const remote = GetSerializedWid(id.remote);
        const participant =
            id.participant != null ? GetSerializedWid(id.participant) : null;
        value =
            `${id.fromMe ? 'true' : 'false'}_${remote}_${id.id}` +
            (id.self ? `_${id.self}` : '') +
            (participant ? `_${participant}` : '');
    } else {
        value = null;
    }

    if (value != null) {
        id._serialized = value;
    }
    return value == null ? null : value;
}

/**
 * Generic entry point: resolves `_serialized`/`$1` then dispatches to the Wid
 * or MsgKey helper based on the object's shape. Use the specific helpers when
 * the id type is known.
 * @param {string|object} id
 * @returns {string|null}
 */
function GetSerialized(id) {
    const hit = cached(id);
    if (hit.done) return hit.value;
    if (id.remote != null && id.id != null) return GetSerializedMsgKey(id);
    if (id.user != null && id.server != null) return GetSerializedWid(id);
    return null;
}

module.exports = { GetSerialized, GetSerializedWid, GetSerializedMsgKey };
