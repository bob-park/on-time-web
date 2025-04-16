interface MessageField {
  field: string;
  text: string;
}

interface SendNotificationRequest {
  displayMessage: string;
  fields: MessageField[];
}
