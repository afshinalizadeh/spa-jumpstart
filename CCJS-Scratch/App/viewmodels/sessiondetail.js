﻿/// <reference path="../../Scripts/knockout-2.2.1.js" />

define([
  'services/datacontext',
  'durandal/plugins/router',
  'durandal/system',
  'durandal/app',
  'services/logger'],

  function (datacontext, router, system, app, logger) {
    var session = ko.observable();
    var rooms = ko.observableArray();
    var tracks = ko.observableArray();
    var timeSlots = ko.observableArray();
    var isSaving = ko.observable(false);
    var isDeleting = ko.observable(false);

    var activate = function (routeData) {
      var id = parseInt(routeData.id);
      initLookups();
      return datacontext.getSessionById(id, session);
    };

    var deleteSession = function () {
      var msg = 'Delete session "' + session().title() + '" ?';
      var title = 'Confirm Delete';
      isDeleting(true);

      return app.showMessage(msg, title, ['Yes', 'No'])
        .then(confirmDelete);

      function confirmDelete(selectedOption) {
        if (selectedOption === 'Yes') {
          session().entityAspect.setDeleted();
          save()
            .then(success)
            .fail(failed)
            .fin(finish);

          function success() {
            router.navigateTo('#/sessions');
          }

          function failed(error) {
            cancel();
            var errorMsg = 'Error: ' + error.message;
            logger.logError(
              errorMsg, error, system.getModuleId(vm), true);
          }

          function finish() {
            return selectedOption;
          }
        }
        isDeleting(false);
      }
    };

    var canDeactivate = function () {
      if (hasChanges()) {
        var title = 'Do you want to leave "' + session().title() + '" ?';
        var msg = 'Navigate away and cancel your changes?';
        return app.showMessage(title, msg, ['Yes', 'No'])
          .then(confirm);
      }

      function confirm(selectedOption)
      {
        if (selectedOption === 'Yes') {
          cancel();
        }

        return selectedOption;
      }

      return true;
    };

    var initLookups = function () {
      rooms(datacontext.lookups.rooms);
      tracks(datacontext.lookups.tracks);
      timeSlots(datacontext.lookups.timeslots);
    };

    var goBack = function () {
      router.navigateBack();
    };

    var cancel = function () {
      datacontext.cancelChanges();
    };

    var save = function () {
      isSaving(true)
      return datacontext.saveChanges().fin(complete);

      function complete() {
        isSaving(false);
      }
    };

    var hasChanges = ko.computed(function () {
      return datacontext.hasChanges();
    });

    var canSave = ko.computed(function () {
      return hasChanges() && !isSaving();
    });

    var vm = {
      activate: activate,
      deleteSession: deleteSession,
      canDeactivate: canDeactivate,
      goBack: goBack,
      rooms: rooms,
      tracks: tracks,
      timeSlots: timeSlots,
      cancel: cancel,
      canSave: canSave,
      save: save,
      hasChanges: hasChanges,
      session: session,
      title: 'Session Details'
    };

    return vm;
  });