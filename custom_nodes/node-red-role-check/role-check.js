module.exports = function(RED) {
    function RoleCheckNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const requiredRole = config.requiredRole;

        node.on('input', function(msg) {
            const role = msg.payload?.role;
            if (role === requiredRole.toUpperCase()) {
                node.send(msg);
            } else {
                msg.statusCode = 403;
                msg.payload = { ok: false, message: `Access denied: ${requiredRole} only` };
                node.send([null, msg]);
            }
        });
    }
    RED.nodes.registerType("role-check", RoleCheckNode);
};
