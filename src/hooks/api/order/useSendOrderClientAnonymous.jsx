import { useState } from "react";
import { OrderService } from "../../../apis/clientV2/OrderService";

const useSendOrderClientAnonymous = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const service = new OrderService();

  const sendOrder = async ({
    delivery,
    assignedKitchenId,
    comment,
    paymentMethod,
    orderItems,
    locationId,
    phone,
    name,
    origin,
  }) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const order = {
        delivery,
        assignedKitchenId,
        comment,
        paymentMethod,
        orderItems,
        locationId,
        phone,
        name,
        origin,
      };

      const response = await service.createPublic(order);
      setResponse(response);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }

  }

  return {
    isLoading,
    error,
    response,
    sendOrder
  };
}

export { useSendOrderClientAnonymous };
