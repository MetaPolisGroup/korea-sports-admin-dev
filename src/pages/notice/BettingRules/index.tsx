import React from "react";
import { Button, Form, Space } from "antd";
import { useAppSelector } from "../../../app/hook";
import Components from "../../../components";
import Popup, { PopupRef } from "../../../components/Popup";
import { queryBuilderFunc } from "../../../service/queryFunction";
import { getColumns } from "../columns";
import FormPopup, { IFormData } from "../FormPopup/content";
import noticeApi, { CreatingFormRef, IData } from "../../../api/noticeApi";
import Utils from "../../../utils";
import { handleExcel } from "..";
import { HeaderContent } from '../../../components/Layout';


const BettingRule = () => {
  const [datas, setDatas] = React.useState<IData[]>([]);
  const [old, setOld] = React.useState<IData[]>([])
  const [loading, setLoading] = React.useState<boolean>(false);
  const popupRef = React.createRef<PopupRef>();
  const infoFormRef = React.createRef<CreatingFormRef>();
  const [form] = Form.useForm();
  const { id } = useAppSelector((state) => state.auth.auth);

  React.useEffect(() => {
    (async () =>
      queryBuilderFunc(
        "notifications",
        [["type", "==", "Betting rules"],
        ["status", "!=", "Deleted"],
        ],
        [{ field: 'status', direction: 'asc' }, { field: 'created_at', direction: 'desc' }],
        undefined,
        (docs) => {
          setDatas(docs as IData[]);
          if (old.length === 0)
            setOld(docs as IData[])
        }
      ))();
  }, []);
  const handleSubmitForm = () => {
    infoFormRef.current?.onSubmit<IFormData>((value) => {
      popupRef.current?.close();

      if (value)
        noticeApi
          .Create({
            status: !value.status ? "Active" : "Inactive",
            content: value.content,
            title: value.title,
            registrant: id!,
            type: "Betting rules",
          })
          .then((i) => {
            if (!i) return Utils.notification.error("실패한");;
            Utils.notification.success("성공을 창출하십시오");
          });
    });
  };
  return (
    <div className="wrapper-managerticket">
      <HeaderContent leftItem={<Space direction="vertical">
        <h2>베팅규정</h2>
        <Space>
          <Button onClick={() => handleExcel(datas, 'bettingRules')}>이자형</Button>
          <Popup
            width={700}
            title="신규 생성"
            ref={popupRef}
            onSubmit={handleSubmitForm}
            selector={
              <Button onClick={() => popupRef.current?.open()}>만들다</Button>
            }
            content={<FormPopup ref={infoFormRef} />}
          />
        </Space>
      </Space>}
        loading={setLoading} callback={search => {
          if (!search.trim() || !datas) {
            return setDatas(old)
          }
          const filter = datas.filter((i) =>
            i.registrant?.toLowerCase().includes(search.toLowerCase()) ||
            i.id?.toString().toLowerCase().includes(search.toLowerCase())
          );
          setDatas(filter)
        }} />

      <Components.ListingTable<IData>
        columns={getColumns(form, id!)}
        loading={loading}
        datas={datas}
        render={(data, value, indexRow, indexColumn) => {
          return <span>{value}</span>;
        }}
      />
    </div>
  );
};

export default BettingRule;
