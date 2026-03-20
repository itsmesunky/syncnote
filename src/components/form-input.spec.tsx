import { useForm } from "react-hook-form";

import { render, screen } from "@/lib/test/render";

import { FormInput } from "./form-input";
import { Form } from "./ui/form";

const MockForm = ({
  contentType,
  label,
}: {
  contentType?: "input" | "textarea";
  label?: string;
}) => {
  const methods = useForm();
  const { control } = methods;

  return (
    <Form {...methods}>
      <form>
        <FormInput fieldName="test" control={control} label={label} contentType={contentType} />
      </form>
    </Form>
  );
};

describe("form-input 컴포넌트", () => {
  it("prop으로 전달한 label이 표시되어야 한다.", () => {
    render(<MockForm label="테스트 라벨" />);
    expect(screen.getByLabelText("테스트 라벨")).toBeInTheDocument();
  });

  it("prop으로 contentType을 전달하지 않을 때는 input 태그가 표시되어야 한다.", () => {
    render(<MockForm />);
    const textbox = screen.getByRole("textbox");
    expect(textbox.tagName).toBe("INPUT");
  });

  it("prop으로 전달한 contentType이 'textarea'일 때는 textarea 태그가 표시되어야 한다.", () => {
    render(<MockForm contentType="textarea" />);
    const textbox = screen.getByRole("textbox");
    expect(textbox.tagName).toBe("TEXTAREA");
  });
});
