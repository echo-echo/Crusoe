Meteor.subscribe("userData")

Template.profile.rendered = function(){
	$('ul.tabs').tabs()
	$('.modal-trigger').leanModal()
}

Template.profile.helpers({
	taggedMessages: function(){
		var result=[]
		var tagged = Meteor.users.find({}).fetch()[0].tagged

		
		tagged.forEach(function(item){
			result.push(Messages.find({_id:item}).fetch()[0])

		})

		return result
	},

	userCreated: function(){
		var created = Messages.find({username:Meteor.user().username})
		return created
	},

	showHide: function(){
		return Session.get("showHide")
	}
})

Template.profile.events({
	"click .saved-title": function(){
		
	}
})