const should = require("chai").should();
const helper = require("node-red-node-test-helper");
const RoleCheckNode = require("../nodes/role-check.js");

helper.init(require.resolve("node-red"));

describe("Role Check Node", function () {
  this.timeout(5000);

  beforeEach(function (done) {
    helper.startServer(function (err) {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  });

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(done);
    }).catch(done);
  });

  it("should be loaded with correct properties", function (done) {
    const flow = [
      {
        id: "n1",
        type: "role-check",
        name: "test-node",
        requiredRole: "admin",
      },
    ];

    helper.load(RoleCheckNode, flow, function (err) {
      if (err) {
        done(err); // Fail the test if loading errors
        return;
      }
      try {
        const n1 = helper.getNode("n1");
        if (!n1) {
          done(new Error("Node n1 not found"));
          return;
        }
        n1.should.have.property("name", "test-node");
        n1.should.have.property("requiredRole", "admin");
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("should forward message to first output if role matches", function (done) {
    const flow = [
      {
        id: "n1",
        type: "role-check",
        name: "test-node",
        requiredRole: "ADMIN",
        wires: [["n2"], ["n3"]],
      },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" },
    ];

    helper.load(RoleCheckNode, flow, function (err) {
      if (err) {
        done(err);
        return;
      }
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      const n3 = helper.getNode("n3");

      n2.on("input", function (msg) {
        try {
          msg.should.have.property("payload").eql({ role: "ADMIN" });
          done();
        } catch (err) {
          done(err);
        }
      });

      n3.on("input", function () {
        done(new Error("Message sent to wrong output"));
      });

      n1.receive({ payload: { role: "ADMIN" } });
    });
  });

  it("should send error to second output if role does not match", function (done) {
    const flow = [
      {
        id: "n1",
        type: "role-check",
        name: "test-node",
        requiredRole: "ADMIN",
        wires: [["n2"], ["n3"]],
      },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" },
    ];

    helper.load(RoleCheckNode, flow, function (err) {
      if (err) {
        done(err);
        return;
      }
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      const n3 = helper.getNode("n3");

      n3.on("input", function (msg) {
        try {
          msg.should.have.property("statusCode", 403);
          msg.should.have
            .property("payload")
            .eql({ ok: false, message: "Access denied: ADMIN only" });
          done();
        } catch (err) {
          done(err);
        }
      });

      n2.on("input", function () {
        done(new Error("Message sent to wrong output"));
      });

      n1.receive({ payload: { role: "USER" } });
    });
  });

  it("should handle missing role in payload", function (done) {
    const flow = [
      {
        id: "n1",
        type: "role-check",
        name: "test-node",
        requiredRole: "ADMIN",
        wires: [["n2"], ["n3"]],
      },
      { id: "n2", type: "helper" },
      { id: "n3", type: "helper" },
    ];

    helper.load(RoleCheckNode, flow, function (err) {
      if (err) {
        done(err);
        return;
      }
      const n1 = helper.getNode("n1");
      const n2 = helper.getNode("n2");
      const n3 = helper.getNode("n3");

      n3.on("input", function (msg) {
        try {
          msg.should.have.property("statusCode", 403);
          msg.should.have
            .property("payload")
            .eql({ ok: false, message: "Access denied: ADMIN only" });
          done();
        } catch (err) {
          done(err);
        }
      });

      n2.on("input", function () {
        done(new Error("Message sent to wrong output"));
      });

      n1.receive({ payload: {} });
    });
  });
});