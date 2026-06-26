import { useCallback, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { statusNext } from "../../Utils/const/statusChange/listNextStatus";
import { OrderService } from "../../apis/clientV2/OrderService";
import { statusOrderCol } from "../../Utils/listStatus";
import { useAuth } from "../../Context/AuthContext";
import { ConfirmActionButton } from "./../common/ConfirmActionButton";
import { useIsValidChangeStatus } from "./useIsValidChangeStatus";

function NextStatusButton({ data }) {
  const { token } = useAuth();
  const orderService = useMemo(() => new OrderService(token), [token]);

  const buttonLabel = statusOrderCol[data.status]?.textNextStatus || "Change Status";

  const [isLoading, setIsLoading] = useState(false);

  const nextStatus = useCallback(async () => {
    const id = data.id;
    const previousState = data.status;
    const nextState = statusNext(data);
    setIsLoading(true);
    try {
      await orderService.changeStatus(id, previousState, nextState);
    } catch (error) {
      toast.error(`Error changing order status: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [data.id, data.status, orderService, data]);

  //analizamos si el usuario puede cambiar el estado de la orden según su rol
  const isValidChange = useIsValidChangeStatus(data.status);

  return (
    <>
      {isValidChange == false ? (
        <>
        </>
      ) :
        (
          <ConfirmActionButton
            buttonLabel={buttonLabel}
            isLoading={isLoading}
            onConfirm={nextStatus}
            variant="primary"
            confirmVariant="success"
            cancelVariant="danger"
          />
        )}

    </>

  );
}

export { NextStatusButton };
