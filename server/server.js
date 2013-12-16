
Users = new Meteor.Collection('users');

Messages = new Meteor.Collection('messages');
ChatStream = new Meteor.Stream('chat');

Meteor.publish('Users', function() {
    return Users.find();
});


ChatStream.permissions.write(function() {
    return true;
});

ChatStream.permissions.read(function() {
    return true;
});

Meteor.methods({
    addMessage2 : function (newMessage) {

        if (newMessage.userName == "") {
            throw new Meteor.Error(413, "Missing a user name...");
        }
        if (newMessage.message == "") {
            throw new Meteor.Error(413, "Missing message content...");
        }
        var id = Messages.insert(newMessage);

        var cursor = Messages.find();
        if (cursor.count() > 20) {
            var oldestMessage = Messages.findOne();
            Messages.remove(oldestMessage);
        }

        return id;
    },


    addMessage1: function(room_name, message) {
        Messages.insert({
            userId: this.userId,
        message: message,
        created_on: new Date().getTime()
        });
    },
    joinRoom: function(name) {
        var userId = Users.insert({ name: name,
            last_keepalive: new Date().getTime() });

        return userId;
    },
    keepalive: function(user_id) {
        check(user_id, String);

        Users.update({ _id: user_id },
                { $set: { last_keepalive: new Date().getTime() }});
    }
});

Meteor.setInterval(function () {
    var now = new Date().getTime();
    var idle_threshold = now - 60 * 1000; // 1 minute

    Users.remove({last_keepalive: { $lt: idle_threshold }});
}, 30 * 1000);

