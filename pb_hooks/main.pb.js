//only one overlay can be 'active' at the same time
//setting an overlay to 'active' de-activates all other overlays
onRecordUpdateExecute((e) => {
    if (e.record.getBool("active") !== true) {
        e.next();
        return;
    }

    e.app.db().newQuery(`
        UPDATE overlays
        SET active = FALSE
        WHERE id != {:id} AND active = TRUE
    `).bind({ id: e.record.id }).execute();

    e.next();
}, "overlays");